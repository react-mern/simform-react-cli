import chalk, { ColorName } from "chalk";

const log = console.log;

function logger(color: ColorName, text: string | string[]) {
  log(chalk[color](text));
}
export function initiatorLog(message: string) {
  logger("cyan", `++++++++++++++++++++++ ${message} ++++++++++++++++++++++`);
}

export default logger;
