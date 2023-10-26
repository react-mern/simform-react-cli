#!/usr/bin/env node

//=============== main executer ==============//

import GlobalStateUtility from "@/global";
import getCurrentPackageManager from "@/operation/getPackageManager";
import getProjectName from "@/operation/getProjectName";
import getCurrentProject from "@/operation/getProjectType";
import projectGenerator, {
  reactRouterAdder,
} from "@/operation/projectGenerator";
import stateManagementCachingSolAdder from "@/operation/stateManagementCachingSol";
import { toolingAdder } from "@/operation/tooling";
import { uiLibraryAdder } from "@/operation/uiLibrary";
import {
  getI18n,
  getSelectedLanguage,
  getSelectedStateManagementAndCachingSol,
  getSelectedTooling,
  getSelectedUiLibrary,
  getSupportedProjectGen,
  getSelectedTesting,
} from "@/questions";
import { changeDirAndDetectProject, pluginEntryAdder } from "@/utils/file";
import logger from "@/utils/logger";
import i18nAdder from "@/operation/i18n";
import { pluginDependencyAdder } from "@/utils/file";
import initGitRepo from "@/operation/initGit";
import { absolutePathConfigAdderInReact } from "@/operation/projectGenerator/projectGenerator";
import readmeGenerator from "@/operation/readme";
import cmdRunner from "@/utils/cmdRunner";
import { NodePackageManager, SupportedProjectType } from "@/types";
import addTestingInProject from "@/operation/testing";

/**
 * current we are storing the config with code but if we increase the number of features then we can have plugin dir that has it's own config file
 * And from that plugin repo we can download the folder and from that config we can modify our page.tsx or App.tsx based on that object
 */
async function main() {
  try {
    //================= questions ==================//

    //get preferred node package manager from the user(if not found exist)
    const currentPackageManager = await getCurrentPackageManager();

    //get the project language from the user
    const selectedLanguage = await getSelectedLanguage();

    //get the project name from the user
    const projectName = await getProjectName();

    //get the project type from the user
    const selectedProjectType = await getSupportedProjectGen();

    //============== creating global instance ===============//
    GlobalStateUtility.initializeInstance(
      currentPackageManager,
      projectName,
      selectedLanguage,
      selectedProjectType,
    );

    //get testing status
    const addTesting = await getSelectedTesting();

    //get tooling related responses
    const { addPrettier, addStoryBook, addHusky } = await getSelectedTooling();

    //get state management and caching solution
    const cachingOption = await getSelectedStateManagementAndCachingSol();

    //get ui library
    const { selectedLibrary } = await getSelectedUiLibrary(selectedProjectType);

    //get add i18n or not
    const addI18n = await getI18n();

    //generate the project based on usr's selection (react [vite or cra] or nextJs)
    await projectGenerator();

    //changing directory and checking project exists or not (if exist from child process then starting boilerplate is not there)
    await changeDirAndDetectProject();

    //git init and add git ignore file
    await initGitRepo();

    //getting project types if react then config related to react projects
    const projectType = getCurrentProject();
    if (projectType === SupportedProjectType.REACT) {
      absolutePathConfigAdderInReact(selectedLanguage, selectedProjectType);
      await reactRouterAdder();
    }

    // ESLint or Prettier or Storybook or Husky
    await toolingAdder(addPrettier, addStoryBook, addHusky);

    //State Management and Caching solution
    await stateManagementCachingSolAdder(cachingOption);

    //antD or material ui
    await uiLibraryAdder(selectedLibrary);

    //Testing adder
    addTesting && (await addTestingInProject());

    //i18
    await i18nAdder(addI18n);

    //adds Provider in layout or index files
    await pluginEntryAdder();

    //install dependencies of the plugins
    await pluginDependencyAdder();

    //generating readme file
    await readmeGenerator({
      currentProjectType: selectedProjectType,
      cachingOption: cachingOption,
      currentPackageManager: currentPackageManager,
      husky: addHusky,
      i18n: addI18n,
      language: selectedLanguage,
      prettier: addPrettier,
      selectedLibrary: selectedLibrary,
      storybook: addPrettier,
    });

    //formatting the code if prettier is available
    if (addPrettier) {
      const formatCmd =
        currentPackageManager === NodePackageManager.NPM
          ? ["run", "format"]
          : ["format"];
      await cmdRunner(currentPackageManager, formatCmd);
    }

    logger("green", "\n ☺️ Happy Coding !");
  } catch (e: unknown) {
    logger("green", "\n ☺️ Happy Coding !");
  }
}

main();
