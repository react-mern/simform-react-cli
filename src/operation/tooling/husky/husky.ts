import path from "path";
import fs from "fs";
import { NodePackageManager, SupportedProjectType } from "@/types";
import { initiatorLog } from "@/utils/logger";
import { isFileExists, writeFileFromConfig } from "@/utils/file";
import cmdRunner from "@/utils/cmdRunner";
import getCurrentProject from "@/operation/getProjectType";
import HuskyNextPlugin from "@/plugins/nextjs/husky";

async function addHuskyInProject(currentPackageManager: NodePackageManager) {
  initiatorLog("Adding Husky, Please wait !");

  const projectType = getCurrentProject();

  await cmdRunner(currentPackageManager, [
    currentPackageManager === NodePackageManager.NPM ? "install" : "add",
    "-D",
    "husky",
    "lint-staged",
  ]);

  await cmdRunner("npx", ["husky", "install"]);

  await cmdRunner("npx", [
    "husky",
    "add",
    ".husky/pre-commit",
    "npx lint-staged",
  ]);

  //based on project type run the configuration
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addHuskyInNext();
      break;
    case SupportedProjectType.REACT:
      await addHuskyInReact(currentPackageManager);
      break;
    default:
      break;
  }
}

async function addHuskyInReact(currentPackageManager: NodePackageManager) {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  const stagedCommand = [];

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const prefixForCmd = `${currentPackageManager} ${
    currentPackageManager === NodePackageManager.NPM ? "run " : ""
  }`;

  if (isFileExists(process.cwd(), "prettier"))
    stagedCommand.push(prefixForCmd + "format");

  if (isFileExists(process.cwd(), "eslint"))
    stagedCommand.push(prefixForCmd + "lint");

  packageJson["lint-staged"] = {
    "*.{ts,tsx}": stagedCommand,
  };

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf8",
  );
}

async function addHuskyInNext() {
  await writeFileFromConfig(HuskyNextPlugin);
}
export default addHuskyInProject;
