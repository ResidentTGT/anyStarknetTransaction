import StateStorage from "../stateStorage";
import { StandardState } from "./simpleState.interface";

export function getStandardState(name: string) {
  const state = StateStorage.load<StandardState>(name, {
    defaultState: { fails: [], successes: [], info: "" },
    readable: true,
    fileExt: ".json",
  });

  return state;
}
