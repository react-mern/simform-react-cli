import path from "path";
import fs from "fs";
import { NodePackageManager } from "@/types";
import { initiatorLog } from "@/utils/logger";
import { isFileExists, writeFileFromConfig } from "@/utils/file";
import cmdRunner from "@/utils/cmdRunner";
import getCurrentProject from "@/operation/getProjectType";
import HuskyNextPlugin from "@/plugins/nextjs/husky";

async function addHuskyInProject(currentPackageManager: NodePackageManager) {
  initiatorLog("Adding Husky, Please wait !");

  const projectType = getCurrentProject();
  const isGitInitialized = isFileExists(process.cwd(), ".git");

  if (isGitInitialized) {
    await cmdRunner("git", ["init"]);
  }
  await cmdRunner(currentPackageManager, [
    currentPackageManager === "npm" ? "install" : "add",
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
    case "next":
      await addHuskyInNext();
      break;
    case "react":
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
    currentPackageManager === "npm" ? "run " : ""
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
    "utf8"
  );
}

async function addHuskyInNext() {
  await writeFileFromConfig(HuskyNextPlugin);
}
export default addHuskyInProject;
