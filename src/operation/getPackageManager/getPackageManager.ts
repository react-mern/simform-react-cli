import { select } from "@inquirer/prompts";
import cmdRunner from "@/utils/cmdRunner";
import logger from "@/utils/logger";
import { NodePackageManager } from "@/types";

//gives user's current package manager
export default async function getCurrentPackageManager() {
  const selectedPackageMng = await select<NodePackageManager>({
    message: "Which package manager are you using?",
    choices: [
      {
        name: "npm",
        value: "npm",
      },
      {
        name: "yarn",
        value: "yarn",
      },
      {
        name: "pnpm",
        value: "pnpm",
      },
    ],
  });
  try {
    await cmdRunner(selectedPackageMng, ["--version"]);
  } catch (error) {
    logger(
      "red",
      `${selectedPackageMng} package manager not found ! please install it or select appropriate one.`
    );
    process.exit(1);
  }
  return selectedPackageMng || "npm";
}
