import chalk, { ColorName } from "chalk";

const log = console.log;

/**
 * A logger function that logs the provided text in a specified color.
 * @param color - The color for the logger.
 * @param text - The text to be logged.
 */
function logger(color: ColorName, text: string | string[]) {
  log(chalk[color](text));
}

/**
 * Prints a message in a specific pattern for initialization.
 * @param message - The message to be displayed.
 */
export function initiatorLog(message: string) {
  logger("cyan", `++++++++++++++++++++++ ${message} ++++++++++++++++++++++`);
}

export default logger;
