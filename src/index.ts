import { Account } from "./account/models/account.type";
import { ChainId, Network } from "./network";
import Random from "./random";
import { StarknetApi } from "./starknetApi";
import StateStorage from "./stateStorage";
import * as fs from "fs";
import { MessageType, log } from "./utils/console";
import { waitEthereumGasPrice } from "./utils/waitEthereumGasPrice";
import { getRandomWithTolerance } from "./utils/getRandomWithTolerance";
import { getStandardState } from "./utils/getStandardState";
import { Myswap } from "./starknet/myswap";
import { Jediswap } from "./starknet/jediswap";
import { Swap10k } from "./starknet/10kswap";
import { Avnu } from "./starknet/avnu";
import { Dmail } from "./starknet/dmail";
import { Flexing } from "./starknet/flexing";
import { Sithswap } from "./starknet/sithswap";
import { StarknetId } from "./starknet/starknetId";
import { Starkverse } from "./starknet/starkverse";
import { Unframed } from "./starknet/unframed";
import { delay } from "./utils/delay";

const DELAY_BETWEEN_ACCS_IN_S = 300; // 5 min
const WAIT_ETHEREUM_GAS_PRICE = 30; // gwei

enum StarknetFunctions {
  Myswap = 1,
  Jediswap = 2,
  Sithswap = 3,
  Avnu = 4,
  _10kswap = 5,
  JediswapLiquidity = 6,
  _10kswapLiquidity = 7,
  Dmail = 8,
  ApproveFlexing = 9,
  ApproveUnframed = 10,
  MintIdentity = 11,
  NostraDeposit = 12,
  StarkgateWithdraw = 13,
  Zklend = 14,
  Starkverse = 15,
  CancelOrderUnframed = 16,
}

const STARKNET_TRANSACTIONS = [
  StarknetFunctions.ApproveFlexing,
  StarknetFunctions.ApproveUnframed,
  StarknetFunctions.Avnu,
  StarknetFunctions.CancelOrderUnframed,
  StarknetFunctions.Dmail,
  StarknetFunctions.Jediswap,
  StarknetFunctions.MintIdentity,
  StarknetFunctions.Myswap,
  StarknetFunctions.Sithswap,
  StarknetFunctions.Starkverse,
  StarknetFunctions._10kswap,
];

const PRIVATE_KEYS = fs
  .readFileSync("private_keys.txt", "utf-8")
  .split(/\r?\n/);

async function main() {
  const network = Network.DefaultByChainId(ChainId.Starknet);
  const api = new StarknetApi(network);

  for (let i = 0; i < PRIVATE_KEYS.length; i++) {
    const account: Account = {
      name: (i + 1).toString(),
      wallets: { starknet: { private: PRIVATE_KEYS[i] } },
    };
    if (!account.wallets?.starknet) throw new Error();
    account.wallets.starknet.address = await api.getAddress(account);

    log(
      `Account ${account.name} (${account.wallets.starknet.address}) started.`,
      MessageType.Info
    );
    const action =
      STARKNET_TRANSACTIONS[
        Random.intFromInterval(1, STARKNET_TRANSACTIONS.length) - 1
      ];

    log(`Starting ${StarknetFunctions[action]} ...`);
    try {
      switch (action) {
        case StarknetFunctions.Myswap:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Myswap.swapRpc(
            account,
            network,
            "ETH",
            "USDC",
            getRandomWithTolerance(0.00004, 0.00003),
            3
          );
          break;
        case StarknetFunctions.Jediswap:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Jediswap.swapRpc(
            account,
            network,
            "ETH",
            "USDC",
            getRandomWithTolerance(0.00004, 0.00003),
            3
          );
          break;
        case StarknetFunctions.Sithswap:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Sithswap.swapRpc(
            account,
            network,
            "ETH",
            "USDC",
            getRandomWithTolerance(0.00004, 0.00003),
            3
          );
          break;
        case StarknetFunctions.Avnu:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Avnu.swapRpc(
            account,
            network,
            "ETH",
            "USDC",
            getRandomWithTolerance(0.00004, 0.00003),
            3
          );
          break;
        case StarknetFunctions._10kswap:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Swap10k.swapRpc(
            account,
            network,
            "ETH",
            "USDC",
            getRandomWithTolerance(0.00004, 0.00003),
            3
          );
          break;
        case StarknetFunctions.Dmail:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Dmail.sendEmailRpc(
            account,
            network,
            account.wallets?.starknet?.address ?? "",
            account.wallets?.starknet?.address ?? ""
          );
          break;
        case StarknetFunctions.ApproveFlexing:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Flexing.approveRpc(
            account,
            network,
            getRandomWithTolerance(0.001, 0.0005)
          );
          break;
        case StarknetFunctions.ApproveUnframed:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Unframed.increaseAllowanceRpc(
            account,
            network,
            getRandomWithTolerance(0.001, 0.0005)
          );
          break;
        case StarknetFunctions.MintIdentity:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await StarknetId.mintIdentityRpc(account, network);
          break;
        case StarknetFunctions.Starkverse:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Starkverse.mintRpc(account, network);
          break;
        case StarknetFunctions.CancelOrderUnframed:
          await waitEthereumGasPrice(WAIT_ETHEREUM_GAS_PRICE);
          await Unframed.cancelOrder(account, network);
          break;
      }
      log(`${StarknetFunctions[action]} finished.`);

      log(
        `Account ${account.name} (${account.wallets.starknet.address}) finished.`,
        MessageType.Info
      );

      const STATE = getStandardState(`starknet`);
      STATE.successes.push(+(account.name ?? i + 1));
      STATE.fails = STATE?.fails.filter((f) => f !== +(account.name ?? i + 1));
      STATE.save();
    } catch (e) {
      log(
        `Account ${account.name} (${account.wallets.starknet.address}). Error during ${StarknetFunctions[action]}\nError: ${e}`,
        MessageType.Error
      );
      const STATE = getStandardState(`starknet`);
      if (!STATE.fails.includes(+(account.name ?? i + 1))) {
        STATE.fails.push(+(account.name ?? i + 1));
        STATE.save();
      }
    }
    if (DELAY_BETWEEN_ACCS_IN_S && i !== PRIVATE_KEYS.length - 1) {
      log(`Waiting ${DELAY_BETWEEN_ACCS_IN_S} s. ...`);
      await delay(DELAY_BETWEEN_ACCS_IN_S);
    }
  }
}

main();
