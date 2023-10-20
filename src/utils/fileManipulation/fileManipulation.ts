import { readFileSync, writeFileSync } from "fs";
import logger from "@/utils/logger";

/**
 * Adds imports and a provider to a file based on the provided regex.
 * @param fileName - The name of the file where modifications are made.
 * @param importStatements - Import statements to be added at the beginning of the file.
 * @param regex - The regex used to detect the component where the provider will be added.
 * @param addBeforeMatch - Content to be added before the detected component.
 * @param addAfterMatch - Content to be added after the detected component.
 * @param errorMsg - Error message to be displayed in case of any errors.
 * @param addAfterContent - Content to be added at the end of the file.
 */
export async function addProviderAndImports(
  fileName: string,
  importStatements: string,
  regex: RegExp,
  addBeforeMatch: string,
  addAfterMatch: string,
  errorMsg: string = "",
  addAfterContent: string = ""
) {
  try {
    const data: string = readFileSync(fileName, "utf8");
    const matchedOutput = data.match(regex);

    if (!matchedOutput?.[0].length) {
      logger("yellow", errorMsg);
      return;
    }

    const replaceString = `${addBeforeMatch}${matchedOutput[0]}${addAfterMatch}`;
    let result = importStatements + "\n" + data.replace(regex, replaceString);
    result += addAfterContent;

    writeFileSync(fileName, result, "utf8");
  } catch (err) {
    console.error(err);
  }
}

/**
 * Generates a regular expression for the provided string.
 * @param myString - The string for which a regex is generated.
 * @returns - A regular expression that can be used to match the specified string.
 *   For example, if the input is "App", it returns a regex that detects "<App></App>" or "<App/>".
 */
export function getRegexForRootComponent(myString: string) {
  const escapedString = myString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `<\\s*${escapedString}\\s*(?:[^>]+)?\\s*>(?:.*?\\n)*?.*?<\\s*\\/\\s*${escapedString}\\s*>|<\\s*${escapedString}\\s*\\/>`,
    "g"
  );
}
