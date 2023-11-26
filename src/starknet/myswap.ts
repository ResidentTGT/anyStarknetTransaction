import { QuoteRequest, Quote, fetchQuotes } from "@avnu/avnu-sdk";
import { ethers } from "ethers";

import puppeteer from "puppeteer";
import { Account } from "../account/models/account.type";
import { CallData, uint256, Account as StarknetAccount } from "starknet";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";
export class Myswap {
  static async swapRpc(
    ACCOUNT: Account,
    network: Network,
    tokenFrom: string,
    tokenTo: string,
    amount?: number,
    slippageInPercent = 0.5
  ): Promise<any> {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const tokenFromAddress = network.tokens.find((t) => t.symbol === tokenFrom)
      ?.address;
    const tokenToAddress = network.tokens.find((t) => t.symbol === tokenTo)
      ?.address;
    if (!tokenFromAddress || !tokenToAddress)
      throw new Error(
        `There is no token.address for ${tokenFrom} or ${tokenTo}`
      );

    const AMM_CONTRACT_ADDRESS =
      "0x010884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28";

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();
    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const tokenFromBalance = await starknetApi.getTokenBalance(
      ACCOUNT.wallets.starknet.address,
      tokenFrom
    );
    const tokenToBalance = await starknetApi.getTokenBalance(
      ACCOUNT.wallets.starknet.address,
      tokenTo
    );

    const amountInWei = amount
      ? ethers.parseUnits(amount.toString(), tokenFromBalance.decimals)
      : tokenFromBalance.balance;
    const amountUint256 = uint256.bnToUint256(amountInWei);

    log(
      `Start swapping ${ethers.formatUnits(
        amountInWei,
        tokenFromBalance.decimals
      )} ${tokenFrom} to ${tokenTo} from ${
        ACCOUNT.wallets.starknet.address
      } ...`
    );

    const params: QuoteRequest = {
      sellTokenAddress: tokenFromAddress,
      buyTokenAddress: tokenToAddress,
      sellAmount: amountInWei,
      takerAddress: account.address,
      size: 1,
    };
    const AVNU_OPTIONS = { baseUrl: "https://starknet.api.avnu.fi" };
    const quote: Quote = (await fetchQuotes(params, AVNU_OPTIONS))[0];

    const { abi: ammAbi } = await provider.getClassAt(AMM_CONTRACT_ADDRESS);
    const { abi: tokenAbi } = await provider.getClassAt(tokenFromAddress);
    if (!ammAbi || !tokenAbi)
      throw new Error("There is no ammAbi or tokenAbi!");

    const amountOutMin =
      (quote.buyAmount * BigInt((100 - slippageInPercent) * 1000)) /
      BigInt(1000) /
      BigInt(100);
    const tokensPair = tokenFrom + tokenTo;
    let poolId;
    if (tokensPair === "ETHUSDC" || tokensPair === "USDCETH") poolId = "1";
    if (tokensPair === "ETHUSDT" || tokensPair === "USDTETH") poolId = "4";
    if (tokensPair === "USDTUSDC" || tokensPair === "USDCUSDT") poolId = "5";
    if (!poolId)
      throw new Error(`There is no pool with tokens pair ${tokensPair}`);
    const { transaction_hash: txHash } = await account.execute(
      [
        {
          contractAddress: tokenFromAddress,
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: AMM_CONTRACT_ADDRESS,
            amount: amountUint256,
          }),
        },
        {
          contractAddress: AMM_CONTRACT_ADDRESS,
          entrypoint: "swap",
          calldata: CallData.compile({
            pool_id: poolId,
            token_from_addr: tokenFromAddress,
            amount_from: amountUint256,
            amount_to_min: uint256.bnToUint256(amountOutMin),
          }),
        },
      ],
      [tokenAbi, ammAbi]
    );

    log(`Transaction hash: ${txHash} .`);
    await delay(5);

    // const resp = await provider.waitForTransaction(txHash);
    // if (resp.execution_status !== "SUCCEEDED") {
    //   throw new Error(`resp.execution_status is ${resp.execution_status}`);
    // }

    log(
      `${ethers.formatUnits(
        amountInWei,
        tokenFromBalance.decimals
      )} ${tokenFrom} swapped for minimum ${ethers.formatUnits(
        amountOutMin,
        tokenToBalance.decimals
      )} ${tokenTo} from ${ACCOUNT.wallets.starknet.address} .`
    );
  }
}
