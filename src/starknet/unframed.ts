import { CallData, Account as StarknetAccount, uint256 } from "starknet";
import puppeteer from "puppeteer";
import { ethers } from "ethers";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";
import Random from "../random";

export class Unframed {
  static async increaseAllowanceRpc(
    ACCOUNT: Account,
    network: Network,
    amount: number
  ) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();

    const contractAddress =
      "0x51734077ba7baf5765896c56ce10b389d80cdcee8622e23c0556fb49e82df1b";

    const tokenAddress = network.tokens.find((t) => t.symbol === "ETH")
      ?.address;
    if (!tokenAddress) throw new Error(`There is no token.address`);

    log(`Start increasing allowance on Unframed ...`);

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: tokenAddress,
        entrypoint: "increaseAllowance",
        calldata: CallData.compile({
          spender: contractAddress,
          added_value: uint256.bnToUint256(
            ethers.parseUnits(amount.toString())
          ),
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(`Allowance increased.`);
  }

  static async cancelOrder(ACCOUNT: Account, network: Network) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();

    const contractAddress =
      "0x051734077ba7baf5765896c56ce10b389d80cdcee8622e23c0556fb49e82df1b";

    log(`Start cancelling order on Unframed ...`);

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: contractAddress,
        entrypoint: "cancel_orders",
        calldata: CallData.compile({
          order_nonces: [Random.intFromInterval(1, 1000000).toString()],
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(`Order cancelled.`);
  }
}
