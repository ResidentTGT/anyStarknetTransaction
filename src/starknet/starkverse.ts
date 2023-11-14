import { CallData, Account as StarknetAccount } from "starknet";

import puppeteer from "puppeteer";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class Starkverse {
  static async mintRpc(ACCOUNT: Account, network: Network) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();

    const contractAddress =
      "0x060582df2cd4ad2c988b11fdede5c43f56a432e895df255ccd1af129160044b8";

    log(
      `Start minting Starkverse NFT from ${ACCOUNT.wallets.starknet.address} ...`
    );

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: contractAddress,
        entrypoint: "publicMint",
        calldata: CallData.compile({
          to: ACCOUNT.wallets.starknet.address,
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(`Starkverse NFT minted from ${ACCOUNT.wallets.starknet.address}.`);
  }
}
