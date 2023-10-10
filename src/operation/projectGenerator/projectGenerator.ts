import { NodePackageManager, SupportedLanguage } from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import logger, { initiatorLog } from "@/utils/logger";
import { writeFileFromConfig } from "@/utils/file";
import GlobalStateUtility from "@/global";
import ReactRouterDomReactPlugin from "@/plugins/react/reactRouterDom";

//Main function to init project generation
export default async function projectGenerator() {
  initiatorLog("Generating Boilerplate, Please wait !");

  const globalState = GlobalStateUtility.getInstance();
  const selectedProjectType = globalState.getCurrentProjectGenType();
  const projectName = globalState.getProjectName();
  const selectedLanguage = globalState.getCurrentLanguage();
  const currentPackageManager = globalState.getCurrentPackageManager();

  switch (selectedProjectType) {
    case "react-vite":
      await initReactViteProject(
        projectName,
        currentPackageManager,
        selectedLanguage
      );
      break;
    case "react-cra":
      await initReactCraProject(
        projectName,
        currentPackageManager,
        selectedLanguage
      );
      break;
    case "next":
      await initNextJsProject(
        projectName,
        currentPackageManager,
        selectedLanguage
      );
      break;
    default:
      break;
  }
}

//init react-vite boiler plate generation
async function initReactViteProject(
  projectName: string,
  packageManager: NodePackageManager,
  selectedLanguage: SupportedLanguage
) {
  const viteCommand = packageManager === "npm" ? "vite@latest" : "vite";
  const tsProjectOrNot = selectedLanguage === "ts" ? "react-ts" : "react";

  try {
    await cmdRunner(packageManager, [
      "create",
      viteCommand,
      projectName,
      `${packageManager === "npm" ? "--" : ""}`,
      `--template`,
      tsProjectOrNot,
    ]);
    console.log(
      `Now install dependencies with ${packageManager} \n run : ${packageManager} install`
    );
  } catch (error) {
    process.exit(1);
  }
}

//init react-cra boiler plate generation
async function initReactCraProject(
  projectName: string,
  packageManager: NodePackageManager,
  selectedLanguage: SupportedLanguage
) {
  const currentLanguage =
    selectedLanguage === "ts" ? "typescript" : "javascript";

  try {
    await cmdRunner("npx", [
      "create-react-app",
      projectName,
      `--template`,
      currentLanguage,
    ]);
  } catch (error) {
    process.exit(1);
  }
}

//init nextJs boilerplate generation
async function initNextJsProject(
  projectName: string,
  packageManager: NodePackageManager,
  selectedLanguage: SupportedLanguage
) {
  try {
    await cmdRunner("npx", [
      "create-next-app@latest",
      projectName,
      `--use-${packageManager}`,
      "--import-alias",
      "@/*",
      "--src-dir",
      `${selectedLanguage === "ts" ? "--ts" : "--js"}`,
      "--app",
    ]);
    logger("green", "😊 NextJs boilerplate generated successfully !");
  } catch (error) {
    process.exit(1);
  }
}

export async function reactRouterAdder() {
  await writeFileFromConfig(ReactRouterDomReactPlugin, "react-vite");
  logger("yellow", "Successfully added react-router-dom with routing !");
}
