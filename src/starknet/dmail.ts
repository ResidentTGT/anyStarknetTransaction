import { Contract, Account as StarknetAccount } from "starknet";
import { Account } from "../account/models/account.type";
import { Network } from "../network";
import { StarknetApi } from "../starknetApi";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

export class Dmail {
  static async sendEmailRpc(
    ACCOUNT: Account,
    network: Network,
    to: string,
    subject: string
  ) {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    log(
      `Start sending message with subject '${subject}' to '${to}' from ${ACCOUNT.wallets.starknet.address} ...`
    );

    const DMAIL_CONTRACT_ADDRESS =
      "0x0454f0bd015e730e5adbb4f080b075fdbf55654ff41ee336203aa2e1ac4d4309";

    const provider = new StarknetApi(network).getProvider();

    const { abi: dmailAbi } = await provider.getClassAt(DMAIL_CONTRACT_ADDRESS);
    if (!dmailAbi) throw new Error("There is no dmailAbi!");
    const dmailContract = new Contract(
      dmailAbi,
      DMAIL_CONTRACT_ADDRESS,
      provider
    );

    const account = new StarknetAccount(
      provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );
    dmailContract.connect(account);

    const { transaction_hash: txHash } = await dmailContract.transaction(
      to,
      subject
    );
    log(`Transaction hash: ${txHash} .`);
    await delay(5);

    // const resp = await provider.waitForTransaction(txHash);
    // if (resp.execution_status !== "SUCCEEDED") {
    //   throw new Error(`resp.execution_status is ${resp.execution_status}`);
    // }

    log(
      `Message with subject ${subject} sent from ${ACCOUNT.wallets.starknet.address} to ${to} .`
    );
  }
}
