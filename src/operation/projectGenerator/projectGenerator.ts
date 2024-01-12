import path from "path";
import fs from "fs";
import {
  NodePackageManager,
  SupportedLanguage,
  SupportedProjectGenerator,
  SupportedUILibrary,
} from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import logger, { initiatorLog } from "@/utils/logger";
import {
  deleteFile,
  parseJsonWithComments,
  writeFile,
  writeFileFromConfig,
} from "@/utils/file";
import GlobalStateUtility from "@/global";
import ReactRouterDomReactPlugin from "@/plugins/react/reactRouterDom";

//Main function to init project generation
export default async function projectGenerator(selectedUILibrary:SupportedUILibrary) {
  initiatorLog("Generating Boilerplate, Please wait !");

  const globalState = GlobalStateUtility.getInstance();
  const selectedProjectType = globalState.getCurrentProjectGenType();
  const projectName = globalState.getProjectName();
  const selectedLanguage = globalState.getCurrentLanguage();
  const currentPackageManager = globalState.getCurrentPackageManager();

  switch (selectedProjectType) {
    case SupportedProjectGenerator.REACT_VITE:
      await initReactViteProject(
        projectName,
        currentPackageManager,
        selectedLanguage,
      );
      break;
    case SupportedProjectGenerator.REACT_CRA:
      await initReactCraProject(
        projectName,
        currentPackageManager,
        selectedLanguage,
      );
      break;
    case SupportedProjectGenerator.NEXT:
      await initNextJsProject(
        projectName,
        currentPackageManager,
        selectedLanguage,
        selectedUILibrary
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
  selectedLanguage: SupportedLanguage,
) {
  const viteCommand =
    packageManager === NodePackageManager.NPM ? "vite@latest" : "vite";
  const tsProjectOrNot =
    selectedLanguage === SupportedLanguage.TS ? "react-ts" : "react";

  try {
    await cmdRunner(packageManager, [
      "create",
      viteCommand,
      projectName,
      `${packageManager === NodePackageManager.NPM ? "--" : ""}`,
      `--template`,
      tsProjectOrNot,
    ]);
  } catch (error) {
    process.exit(1);
  }
}

//init react-cra boiler plate generation
async function initReactCraProject(
  projectName: string,
  packageManager: NodePackageManager,
  selectedLanguage: SupportedLanguage,
) {
  const commandLine = ["create-react-app", projectName];

  if (selectedLanguage === "ts") commandLine.push("--template", "typescript");

  try {
    await cmdRunner("npx", commandLine);
  } catch (error) {
    process.exit(1);
  }
}

//init nextJs boilerplate generation
async function initNextJsProject(
  projectName: string,
  packageManager: NodePackageManager,
  selectedLanguage: SupportedLanguage,
  isSelectedUILibrary:SupportedUILibrary
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
      `${isSelectedUILibrary ? "--no-tailwind":""}`,
      "--app",
    ]);
    logger("green", "😊 NextJs boilerplate generated successfully !");
  } catch (error) {
    process.exit(1);
  }
}

export async function reactRouterAdder() {
  const globalState = GlobalStateUtility.getInstance();
  const getCurrentLanguage = globalState.getCurrentLanguage();

  if (getCurrentLanguage === SupportedLanguage.JS) {
    deleteFile(path.join(process.cwd(), "src"), "App.js");
  }

  await writeFileFromConfig(ReactRouterDomReactPlugin);
}

//adds absolute path config in tsconfig.json or creates jsconfig.json if js project
export function absolutePathConfigAdderInReact(
  selectedLanguage: SupportedLanguage,
  selectedProjectType: SupportedProjectGenerator,
) {
  try {
    if (selectedProjectType === SupportedProjectGenerator.REACT_VITE) {
      const extraConfig = `
    // additional configuration for absolute path
    resolve: {
      alias: {
      src: "/src",
    },
  },
`;

      const viteConfigFileName = `vite.config.${
        selectedLanguage === SupportedLanguage.TS ? "ts" : "js"
      }`;

      const viteConfigPath = path.join(process.cwd(), viteConfigFileName);
      const viteConfig = fs.readFileSync(viteConfigPath, "utf8");

      const modifiedConfigString = viteConfig.replace(/(\}\s*\))/s, (match) => {
        return extraConfig + match;
      });

      writeFile(viteConfigFileName, modifiedConfigString);
    }

    if (selectedLanguage === SupportedLanguage.TS) {
      const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
      const tsConfig = parseJsonWithComments(
        fs.readFileSync(tsConfigPath, "utf8"),
      );

      tsConfig["compilerOptions"]["baseUrl"] = "./";
      tsConfig["compilerOptions"]["paths"] = {
        "src/*": ["./src/*"],
      };

      fs.writeFileSync(
        tsConfigPath,
        JSON.stringify(tsConfig, null, 2),
        "utf-8",
      );
    }

    if (
      selectedProjectType === SupportedProjectGenerator.REACT_CRA &&
      selectedLanguage === SupportedLanguage.JS
    ) {
      const absolutePathConfigForJs = {
        compilerOptions: {
          baseUrl: "./",
          paths: {
            "src/*": ["./src/*"],
          },
        },
      };

      writeFile("jsconfig.json", JSON.stringify(absolutePathConfigForJs));
    }
  } catch (error) {
    console.log(error);
    logger(
      "red",
      "An Error occurred while adding setup related to absolute path !",
    );
  }
}
