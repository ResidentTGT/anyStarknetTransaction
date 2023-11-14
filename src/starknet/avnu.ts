import { TransactionReceiptResponse } from "./models/transactionReceiptResponse.interface";
import { ethers } from "ethers";
import { Account as StarknetAccount } from "starknet";
import {
  Quote,
  QuoteRequest,
  executeSwap,
  fetchQuotes,
  signQuote,
} from "@avnu/avnu-sdk";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class Avnu {
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

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();
    const tokenFromBalance = await starknetApi.getTokenBalance(
      ACCOUNT.wallets.starknet.address,
      tokenFrom
    );
    const tokenToBalance = await starknetApi.getTokenBalance(
      ACCOUNT.wallets.starknet.address,
      tokenTo
    );
    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );
    const amountInWei = amount
      ? ethers.parseUnits(amount.toString(), tokenFromBalance.decimals)
      : tokenFromBalance.balance;

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

    const sign = await signQuote(
      account,
      quote,
      await account.getNonce(),
      network.chainId.toString()
    );
    const swapResp = await executeSwap(
      account,
      quote,
      {
        executeApprove: true,
        gasless: false,
        takerSignature: sign,
        slippage: slippageInPercent / 100,
      },
      AVNU_OPTIONS
    );

    log(`Transaction hash: ${swapResp.transactionHash} . Waiting...`);
    await delay(5);
    const resp = await provider.waitForTransaction(swapResp.transactionHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    const amountOutMin =
      (quote.buyAmount * BigInt((100 - slippageInPercent) * 1000)) /
      BigInt(1000) /
      BigInt(100);
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
