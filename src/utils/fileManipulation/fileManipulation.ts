import fs from "fs";
import logger from "@/utils/logger";

export function addProviderAndImports(
  fileName: string,
  importStatements: string,
  regex: RegExp,
  addBeforeMatch: string,
  addAfterMatch: string,
  errorMsg: string = "",
  addAfterContent: string = ""
) {
  fs.readFile(fileName, "utf8", function (err, data: string) {
    if (err) {
      return logger("red", errorMsg);
    }
    const matchedOutput = data.match(regex);
    if (!matchedOutput?.[0].length) {
      logger("yellow", errorMsg);
      return;
    }
    const replaceString = `${addBeforeMatch}${matchedOutput[0]}${addAfterMatch}`;
    let result = importStatements + "\n" + data.replace(regex, replaceString);

    result += addAfterContent;
    fs.writeFile(fileName, result, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
}

//give the regex that detects the embedded root component in root file

export function getRegexForRootComponent(myString: string) {
  const escapedString = myString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `<\\s*${escapedString}\\s*(?:[^>]+)?\\s*>(?:.*?\\n)*?.*?<\\s*\\/\\s*${escapedString}\\s*>|<\\s*${escapedString}\\s*\\/>`,
    "g"
  );
}
