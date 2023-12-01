import { QuoteRequest, Quote, fetchQuotes } from "@avnu/avnu-sdk";
import { ethers } from "ethers";

import { TransactionReceiptResponse } from "./models/transactionReceiptResponse.interface";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { CallData, uint256, Account as StarknetAccount } from "starknet";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class Jediswap {
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
      "0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023";

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
          entrypoint: "swap_exact_tokens_for_tokens",
          calldata: CallData.compile({
            amountIn: amountUint256,
            amountOutMin: uint256.bnToUint256(amountOutMin),
            path: [tokenFromAddress, tokenToAddress],
            to: account.address,
            deadline: Math.floor(Date.now() + 60000),
          }),
        },
      ],
      [tokenAbi, ammAbi]
    );

    log(`Transaction hash: ${txHash} .`);
    await delay(5);

    const resp = await starknetApi.waitTransaction(txHash);

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

  static async addLiquidityRpc(
    ACCOUNT: Account,
    network: Network,
    token1: string,
    token2: string,
    amountOfToken1: number,
    slippageInPercent = 0.5
  ): Promise<any> {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const token1Address = network.tokens.find((t) => t.symbol === token1)
      ?.address;
    const token2Address = network.tokens.find((t) => t.symbol === token2)
      ?.address;
    if (!token1Address || !token2Address)
      throw new Error(`There is no token.address for ${token1} or ${token2}`);

    const AMM_CONTRACT_ADDRESS =
      "0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023";

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();
    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const token1Balance = await starknetApi.getTokenBalance(
      ACCOUNT.wallets.starknet.address,
      token1
    );

    const amountOfToken1InWei = amountOfToken1
      ? ethers.parseUnits(amountOfToken1.toString(), token1Balance.decimals)
      : token1Balance.balance;
    const amountOfToken1Uint256 = uint256.bnToUint256(amountOfToken1InWei);

    log(
      `Start adding liquidity ${ethers.formatUnits(
        amountOfToken1InWei,
        token1Balance.decimals
      )} ${token1} with some ${token2} from ${
        ACCOUNT.wallets.starknet.address
      } ...`
    );

    const params: QuoteRequest = {
      sellTokenAddress: token1Address,
      buyTokenAddress: token2Address,
      sellAmount: amountOfToken1InWei,
      takerAddress: account.address,
      size: 1,
    };
    const AVNU_OPTIONS = { baseUrl: "https://starknet.api.avnu.fi" };
    const quote: Quote = (await fetchQuotes(params, AVNU_OPTIONS))[0];

    const { abi: ammAbi } = await provider.getClassAt(AMM_CONTRACT_ADDRESS);
    const { abi: token1Abi } = await provider.getClassAt(token1Address);
    const { abi: token2Abi } = await provider.getClassAt(token2Address);
    if (!ammAbi || !token1Abi || !token2Abi)
      throw new Error("There is no ammAbi or tokenAbi!");

    const amountOfToken1MinUint256 = uint256.bnToUint256(
      (amountOfToken1InWei * BigInt((100 - slippageInPercent) * 1000)) /
        BigInt(1000) /
        BigInt(100)
    );
    const amountOfToken2Uint256 = uint256.bnToUint256(quote.buyAmount);
    const amountOfToken2MinUint256 = uint256.bnToUint256(
      (quote.buyAmount * BigInt((100 - slippageInPercent) * 1000)) /
        BigInt(1000) /
        BigInt(100)
    );
    const { transaction_hash: txHash } = await account.execute(
      [
        {
          contractAddress: token1Address,
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: AMM_CONTRACT_ADDRESS,
            amount: amountOfToken1Uint256,
          }),
        },
        {
          contractAddress: token2Address,
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: AMM_CONTRACT_ADDRESS,
            amount: amountOfToken2Uint256,
          }),
        },
        {
          contractAddress: AMM_CONTRACT_ADDRESS,
          entrypoint: "add_liquidity",
          calldata: CallData.compile({
            tokenA: token1Address,
            tokenB: token2Address,
            amountADesired: amountOfToken1Uint256,
            amountBDesired: amountOfToken2Uint256,
            amountAMin: amountOfToken1MinUint256,
            amountBMin: amountOfToken2MinUint256,
            to: account.address,
            deadline: Math.floor(Date.now() + 60000),
          }),
        },
      ],
      [token1Abi, token2Abi, ammAbi]
    );

    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await starknetApi.waitTransaction(txHash);
    log(
      `Liquidity added (${resp.finality_status}) for ${ethers.formatUnits(
        amountOfToken1InWei,
        token1Balance.decimals
      )} ${token1} and ${token2} from ${ACCOUNT.wallets.starknet.address} .`
    );

    return resp;
  }
}
