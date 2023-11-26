import { CallData, Account as StarknetAccount } from "starknet";

import puppeteer from "puppeteer";
import random from "../random";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class StarknetId {
  static async mintIdentityRpc(ACCOUNT: Account, network: Network) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starknetApi = new StarknetApi(network);
    const provider = starknetApi.getProvider();

    const contractAddress =
      "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af";

    log(`Start minting identity...`);

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: contractAddress,
        entrypoint: "mint",
        calldata: CallData.compile({
          starknet_id: random.intFromInterval(400000, 20000000).toString(),
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} .`);
    await delay(5);
    log(`Identity minted.`);
  }
}
