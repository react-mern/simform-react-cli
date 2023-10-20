import fs from "fs";
import path from "path";
import GlobalStateUtility from "@/global";
import { SupportedLanguage, SupportedProjectGenerator } from "@/types";
import { writeFile, writeFileFromConfig } from "@/utils/file";
import { VitestReactVitePlugin } from "@/plugins/react/testing";

export default async function addTestingInProject() {
  const projectType =
    GlobalStateUtility.getInstance().getCurrentProjectGenType();

  switch (projectType) {
    case SupportedProjectGenerator.REACT_VITE:
      await addTestingInReactViteProject();
      break;
    case SupportedProjectGenerator.NEXT:
      await addTestingNextProject();
      break;
    default:
      break;
  }
}

/**
 * Adding extra configuration in vite config file and writing files from plugin
 */
async function addTestingInReactViteProject() {
  //project language from global state
  const selectedLanguage =
    GlobalStateUtility.getInstance().getCurrentLanguage();

  //config to add in vite config
  const configToAdd = `  //testing
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.${selectedLanguage}",
  },`;

  //File name of the vite config based on the project language
  const viteConfigFileName = `vite.config.${
    selectedLanguage === SupportedLanguage.TS ? "ts" : "js"
  }`;

  //vite config path and reading vite config from that path
  const viteConfigPath = path.join(process.cwd(), viteConfigFileName);
  const viteConfig = fs.readFileSync(viteConfigPath, "utf8");

  //modifying vite config
  let modifiedViteConfig = viteConfig.replace(/(\}\s*\))/s, match => {
    return configToAdd + match;
  });

  //adding ts reference in vite config file
  if (selectedLanguage === SupportedLanguage.TS)
    modifiedViteConfig =
      `/// <reference types="vitest" /> \n` + modifiedViteConfig;

  //writing modified content in vite config
  writeFile(viteConfigFileName, modifiedViteConfig);

  //adding type definition if language is typescript
  if (selectedLanguage === SupportedLanguage.TS) {
    const viteEnvDeclarationFileName = "vite-env.d.ts";
    const viteEnvDeclarationPath = path.join(
      process.cwd(),
      "src",
      viteEnvDeclarationFileName
    );
    const viteEnvDeclaration = fs.readFileSync(viteEnvDeclarationPath, "utf8");

    const modifiedViteEnvDeclarationFile =
      viteEnvDeclaration +
      `\n/// <reference types="@testing-library/jest-dom" />`;

    writeFile(
      viteEnvDeclarationFileName,
      modifiedViteEnvDeclarationFile,
      path.join(process.cwd(), "src")
    );
  }

  //base configuration for vitest (testing)
  await writeFileFromConfig(VitestReactVitePlugin);
}

async function addTestingNextProject() {}
