import { readFileSync, writeFileSync } from "fs";
import logger from "@/utils/logger";

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

//give the regex that detects the embedded root component in root file

export function getRegexForRootComponent(myString: string) {
  const escapedString = myString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `<\\s*${escapedString}\\s*(?:[^>]+)?\\s*>(?:.*?\\n)*?.*?<\\s*\\/\\s*${escapedString}\\s*>|<\\s*${escapedString}\\s*\\/>`,
    "g"
  );
}
