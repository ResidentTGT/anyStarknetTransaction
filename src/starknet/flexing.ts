import puppeteer from "puppeteer";
import { Account } from "../account/models/account.type";
import { StarknetApi } from "../starknetApi";
import { Network } from "../network";
import { log } from "../utils/console";
import { ethers } from "ethers";
import {
  CallData,
  uint256,
  Account as StarknetAccount,
  TransactionFinalityStatus,
  TransactionExecutionStatus,
  TransactionStatus,
} from "starknet";
import { delay } from "../utils/delay";

export class Flexing {
  static async approveRpc(ACCOUNT: Account, network: Network, amount: number) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();

    const contractAddress =
      "0x4b1b3fdf34d00288a7956e6342fb366a1510a9387d321c87f3301d990ac19d4";

    const tokenAddress = network.tokens.find((t) => t.symbol === "ETH")
      ?.address;
    if (!tokenAddress) throw new Error(`There is no token.address`);

    log(`Start approving on Flexing ...`);

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: tokenAddress,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: contractAddress,
          amount: uint256.bnToUint256(ethers.parseUnits(amount.toString())),
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} .`);
    await delay(5);

    const resp = await starknetApi.waitTransaction(txHash);
    log(`Approved.`);
  }
}
