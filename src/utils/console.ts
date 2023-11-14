import fs from "fs";

const RED_TEXT = "\u001b[0;31m";
const RED_BOLD_TEXT = "\u001b[1;31m";
const GREEN_TEXT = "\u001b[0;32m";
const YELLOW_TEXT = "\u001b[0;33m";
const BLUE_TEXT = "\u001b[0;34m";
const PURPLE_TEXT = "\u001b[0;35m";
const CYAN_TEXT = "\u001b[0;36m";
const RESET = "\u001b[0m";

export enum MessageType {
  Fatal,
  Error,
  Warn,
  Info,
  Notice,
  Debug,
  Trace,
}

export async function log(
  message: any,
  type: MessageType = MessageType.Trace,
  logToFile = false
) {
  const color = getColor(type);
  const fulldate = new Date().toISOString().replace("Z", "");
  //const time = fulldate.split('T')[1].replace('Z', '');

  console.log(`${color}[${fulldate}] ${message} ${RESET}`);
}

function getColor(type: MessageType) {
  let color = "";

  switch (type) {
    case MessageType.Fatal:
      color = RED_BOLD_TEXT;
      break;
    case MessageType.Error:
      color = RED_TEXT;
      break;
    case MessageType.Warn:
      color = YELLOW_TEXT;
      break;
    case MessageType.Info:
      color = GREEN_TEXT;
      break;
    case MessageType.Notice:
      color = PURPLE_TEXT;
      break;
    case MessageType.Debug:
      color = CYAN_TEXT;
      break;
    case MessageType.Trace:
      color = BLUE_TEXT;
      break;
  }

  return color;
}
