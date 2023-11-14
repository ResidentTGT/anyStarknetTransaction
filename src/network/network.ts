import {
  FetchRequest,
  ethers,
  FetchGetUrlFunc,
  FetchCancelSignal,
  assert,
  getBytes,
} from "ethers";

import { Token, Tokens } from "./";
import { HttpsProxyAgent } from "https-proxy-agent";
import { gunzipSync } from "zlib";
import http from "http";
import https from "https";
import { MessageType, log } from "../utils/console";

export class Network {
  readonly chainId: ChainId;
  readonly name: string;
  readonly nativeCoin: string;
  readonly rpc?: string;
  readonly tokens: Token[] = [];
  provider?: ethers.JsonRpcProvider;

  public static get Defaults(): Network[] {
    return initDefaultNetworks();
  }

  public static DefaultByChainId(id: ChainId) {
    const network = Network.Defaults.find((n) => n.chainId === id);
    if (!network) throw new Error(`There is no network with chainId ${id}`);
    return network;
  }

  public static IsEvm(id: ChainId) {
    const notEvm = [ChainId.Aptos, ChainId.Starknet, ChainId.Sui];
    return !notEvm.includes(id);
  }

  constructor({
    chainId,
    name,
    nativeCoin,
    rpc,
    tokens = [],
  }: Pick<Network, "chainId" | "name" | "nativeCoin" | "rpc" | "tokens">) {
    this.chainId = chainId;
    this.name = name;
    this.nativeCoin = nativeCoin;
    this.tokens = tokens;
    this.rpc = rpc;
    if (rpc && Network.IsEvm(chainId)) {
      this.provider = new ethers.JsonRpcProvider(rpc);
    }
  }

  getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      log(`There is no provider for ${this.name}`, MessageType.Error);
      throw new Error();
    }
    return this.provider;
  }
}

export enum ChainId {
  Ethereum = 1,
  Optimism = 10,
  Bsc = 56,
  Polygon = 137,
  Arbitrum = 42161,
  ArbitrumNova = 42170,
  AvalancheC = 43114,
  ZksyncEra = 324,
  Goerli = 5,
  LineaGoerli = 59140,
  Fantom = 250,
  Aptos = 108,
  Starknet = "0x534e5f4d41494e",
  Sui = 101,
  Core = 1116,
  Zora = 7777777,
  Celo = 42220,
  Base = 8453,
  Gnosis = 100,
  Metis = 1088,
  Canto = 7700,
  Meter = 82,
  Linea = 59144,
  Mantle = 5000,
  PolygonZkEVM = 1101,
  Klaytn = 8217,
  OpBNB = 204,
  Scroll = 534352,
}

function initDefaultNetworks() {
  return [
    new Network({
      chainId: ChainId.Ethereum,
      name: "Ethereum Mainnet",
      nativeCoin: "ETH",
      rpc: "https://eth.llamarpc.com",
      tokens: Tokens.Ethereum,
    }),

    new Network({
      chainId: ChainId.Starknet,
      name: "Starknet Mainnet",
      nativeCoin: "ETH",
      rpc: "https://starknet-mainnet.public.blastapi.io",
      tokens: Tokens.Starknet,
    }),
  ];
}

export default Network;
