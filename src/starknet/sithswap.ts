import { QuoteRequest, Quote, fetchQuotes } from "@avnu/avnu-sdk";
import { ethers } from "ethers";
import { uint256, CallData, Account as StarknetAccount } from "starknet";

import { Account } from "../account/models/account.type";
import { Network } from "../network";

import puppeteer from "puppeteer";
import { TransactionReceiptResponse } from "./models/transactionReceiptResponse.interface";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class Sithswap {
  static async swapRpc(
    ACCOUNT: Account,
    network: Network,
    tokenFrom: string,
    tokenTo: string,
    amount?: number,
    slippageInPercent = 0.5
  ): Promise<TransactionReceiptResponse> {
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
      "0x028c858a586fa12123a1ccb337a0a3b369281f91ea00544d0c086524b759f627";

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
          entrypoint: "swapExactTokensForTokens",
          calldata: CallData.compile({
            amount_in: amountUint256,
            amount_out_min: uint256.bnToUint256(amountOutMin),
            routes: [
              {
                from_address: tokenFromAddress,
                to_address: tokenToAddress,
                stable: 0,
              },
            ],
            to: account.address,
            deadline: Math.floor(Date.now() + 60000),
          }),
        },
      ],
      [tokenAbi, ammAbi]
    );

    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(
      `${ethers.formatUnits(
        amountInWei,
        tokenFromBalance.decimals
      )} ${tokenFrom} swapped (${
        resp.finality_status
      }) for minimum ${ethers.formatUnits(
        amountOutMin,
        tokenToBalance.decimals
      )} ${tokenTo} from ${ACCOUNT.wallets.starknet.address} .`
    );

    return resp;
  }
}
