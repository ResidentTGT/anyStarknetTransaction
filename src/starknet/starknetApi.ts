import {
  Contract,
  RpcProvider,
  uint256,
  Account as StarknetAccount,
  CallData,
  ec,
  hash,
} from "starknet";
import { Network } from "../network";
import { ethers } from "ethers";
import { TokenBalance } from "./models/tokenBalance.interface";
import { Account } from "../account/models/account.type";
import { log } from "../utils/console";
import { delay } from "../utils/delay";

const ERC20_ABI_ADDRESS =
  "0x048624e084dc68d82076582219c7ed8cb0910c01746cca3cd72a28ecfe07e42d";
const ARGENT_CLASS_HASH =
  "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

export class StarknetApi {
  private readonly _provider;
  private readonly _network;

  constructor(network: Network) {
    if (!network.rpc) {
      throw new Error(
        "Couldnt create StarknetApi instance due to lack of rpc!"
      );
    }
    this._network = network;
    this._provider = new RpcProvider({
      nodeUrl: network.rpc,
    });
  }

  getNetwork(): Network {
    return this._network;
  }

  getProvider(): RpcProvider {
    return this._provider;
  }

  async getTokenBalance(
    address: string,
    tokenSymbol: string
  ): Promise<TokenBalance> {
    const contractAddress = this._network.tokens.find(
      (t) => t.symbol === tokenSymbol
    )?.address;
    if (!contractAddress)
      throw new Error(`no ${tokenSymbol} in Starknet tokens.`);

    const { abi: tokenAbi } =
      await this._provider.getClassAt(ERC20_ABI_ADDRESS);
    if (tokenAbi === undefined) throw new Error("no tokenAbi.");

    const contract = new Contract(tokenAbi, contractAddress, this._provider);

    const balance = await contract.balanceOf(address);
    const decimals = (await contract.decimals()).decimals;
    return { balance: uint256.uint256ToBN(balance.balance), decimals };
  }

  async sendEth(ACCOUNT: Account, to: string, amount?: number): Promise<any> {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    log(
      `Start sending ${amount ?? "all"} ${this._network.nativeCoin} from ${
        ACCOUNT.wallets.starknet.address
      } to ${to} ...`
    );

    const ethContractAddress = this._network.tokens.find(
      (t) => t.symbol === this._network.nativeCoin
    )?.address;
    if (!ethContractAddress) throw new Error("no ETH in Starknet tokens.");

    const { abi: ethAbi } = await this._provider.getClassAt(ERC20_ABI_ADDRESS);
    if (ethAbi === undefined) throw new Error("no ethAbi.");

    const ethContract = new Contract(
      ethAbi,
      ethContractAddress,
      this._provider
    );
    const balanceBn = uint256.uint256ToBN(
      (await ethContract.balanceOf(ACCOUNT.wallets.starknet.address)).balance
    );

    const account = new StarknetAccount(
      this._provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );
    ethContract.connect(account);

    const { suggestedMaxFee: estimatedFeeBn } = await account.estimateInvokeFee(
      {
        contractAddress: ethContract.address,
        entrypoint: "transfer",
        calldata: CallData.compile([to, uint256.bnToUint256(balanceBn)]),
      }
    );

    const balance = +ethers.formatEther(balanceBn);
    const estimatedFee = +ethers.formatEther(estimatedFeeBn);

    if (balanceBn < estimatedFeeBn) {
      throw new Error(
        `There is not enough gas (fee: ${estimatedFee} ETH) for transaction`
      );
    }
    let amountBn = undefined;
    if (amount) {
      amountBn = ethers.parseUnits(amount.toString(), 18);
      if (balanceBn - amountBn - estimatedFeeBn < 0) {
        throw new Error(
          `There is not enough balance (balance: ${balance} ETH) for transaction such amount (${amount} ETH)`
        );
      }
    } else {
      amount = balance - estimatedFee;
      amountBn = balanceBn - estimatedFeeBn;
    }

    const { transaction_hash: txHash } = await ethContract.transfer(
      to,
      uint256.bnToUint256(amountBn)
    );
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await this._provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(
      `${amount} ${this._network.nativeCoin} sent (${resp.finality_status}) from ${ACCOUNT.wallets.starknet.address} to ${to} .`
    );

    return resp;
  }

  async upgrade(ACCOUNT: Account): Promise<any> {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    log(`Start upgrading ${ACCOUNT.wallets.starknet.address} ...`);

    const account = new StarknetAccount(
      this._provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );

    const { transaction_hash: txHash } = await account.execute([
      {
        contractAddress: ACCOUNT.wallets.starknet.address,
        entrypoint: "upgrade",
        calldata: CallData.compile({
          implementation: ARGENT_CLASS_HASH,
          calldata: ["0"],
        }),
      },
    ]);
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await this._provider.waitForTransaction(txHash);

    log(`${ACCOUNT.wallets.starknet.address} upgraded.`);

    return resp;
  }

  async getAddress(ACCOUNT: Account): Promise<string> {
    if (!ACCOUNT.wallets?.starknet?.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    const starkKeyPub = ec.starkCurve.getStarkKey(
      ACCOUNT.wallets?.starknet?.private
    );

    const address = hash.calculateContractAddressFromHash(
      starkKeyPub,
      ARGENT_CLASS_HASH,
      CallData.compile({
        owner: starkKeyPub,
        guardian: 0n,
      }),
      0
    );

    const valueAddr = address.split("0x")[1];
    const nullsCount = 64 - valueAddr.length;
    let finalAddr = "0x";
    for (let i = 0; i < nullsCount; i++) {
      finalAddr += "0";
    }
    finalAddr += valueAddr;

    return finalAddr;
  }

  async deployAccount(ACCOUNT: Account): Promise<any> {
    if (!ACCOUNT.wallets?.starknet?.address)
      throw new Error("There is no account.wallets.starknet.address!");
    if (!ACCOUNT.wallets.starknet.private)
      throw new Error(
        "There is no account.wallets.starknet.private in wallet!"
      );

    log(`Start deploying ${ACCOUNT.wallets.starknet.address} ...`);

    const account = new StarknetAccount(
      this._provider,
      ACCOUNT.wallets.starknet.address,
      ACCOUNT.wallets.starknet.private,
      "1"
    );
    const publicKey = ec.starkCurve.getStarkKey(
      ACCOUNT.wallets.starknet.private
    );

    const { transaction_hash: txHash } = await account.deployAccount({
      classHash: ARGENT_CLASS_HASH,
      constructorCalldata: CallData.compile({
        owner: publicKey,
        guardian: 0n,
      }),
      addressSalt: publicKey,
    });
    log(`Transaction hash: ${txHash} . Waiting...`);
    await delay(5);
    const resp = await this._provider.waitForTransaction(txHash);
    if (resp.execution_status !== "SUCCEEDED") {
      throw new Error(`resp.execution_status is ${resp.execution_status}`);
    }
    log(`${ACCOUNT.wallets.starknet.address} deployed.`);

    return resp;
  }
}
