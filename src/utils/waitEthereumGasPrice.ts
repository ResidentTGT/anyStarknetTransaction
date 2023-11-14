import { ethers } from "ethers";
import { ChainId, Network } from "../network";
import { log } from "./console";
import { delay } from "./delay";

export async function waitEthereumGasPrice(
  gasPriceInGwei: number,
  delayInS = 30
) {
  const network = Network.DefaultByChainId(ChainId.Ethereum);
  const provider = network.getProvider();

  let normGas;
  while (!normGas) {
    const gasPrice = (await provider.getFeeData()).gasPrice;
    if (!gasPrice || +ethers.formatUnits(gasPrice, "gwei") > gasPriceInGwei) {
      log(
        gasPrice
          ? `Gas price: ${+ethers.formatUnits(
              gasPrice,
              "gwei"
            )} gwei. Waiting for ${gasPriceInGwei} gwei...`
          : "Couldnt get gas price! Trying again..."
      );
      await delay(delayInS);
    } else {
      normGas = true;
    }
  }
}
