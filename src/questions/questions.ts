import { confirm, select } from "@inquirer/prompts";
import {
  StylingEngineInMui,
  SupportedLanguage,
  SupportedProjectGenerator,
  SupportedStateManagementAndCachingSol,
  SupportedUILibrary,
} from "@/types";
import GlobalStateUtility from "@/global";

/**
 * Asynchronously prompts user to select a supported project language.
 * @returns A Promise that resolves to the selected language.
 */
export async function getSelectedLanguage() {
  const selectedLanguage = await select<SupportedLanguage>({
    message: "Select project language",
    choices: [
      {
        name: "Typescript (Recommended)",
        value: SupportedLanguage.TS,
      },
      {
        name: "Javascript",
        value: SupportedLanguage.JS,
      },
    ],
  });

  return selectedLanguage;
}

/**
 * Asynchronously prompts user to select a supported project generator.
 * @returns A Promise that resolves to the selected project generator.
 */
export async function getSupportedProjectGen() {
  const selectedProjectType = await select<SupportedProjectGenerator>({
    message: "Select the Generator",
    choices: [
      {
        name: "React + Vite (Recommended)",
        value: SupportedProjectGenerator.REACT_VITE,
      },
      {
        name: "Next Js",
        value: SupportedProjectGenerator.NEXT,
      },
      {
        name: "React + Webpack (CRA) ",
        value: SupportedProjectGenerator.REACT_CRA,
      },
    ],
  });
  return selectedProjectType;
}

/**
 * Asynchronously prompts user to select a supported tooling.
 * @returns A Promise that resolves to the selected tooling.
 */
export async function getSelectedTooling() {
  const addPrettier = await confirm({
    message: "Do you want to add Prettier to the project?",
    default: true,
  });

  const addStoryBook = await confirm({
    message: "Do you want to add Storybook to the project?",
    default: true,
  });
  const addHusky = await confirm({
    message: "Do you want to add Husky to the project?",
    default: true,
  });

  return { addPrettier, addStoryBook, addHusky };
}

/**
 * Asynchronously prompts user to select a supported state management and caching solution.
 * @returns A Promise that resolves to the selected state management and caching solution.
 */
export async function getSelectedStateManagementAndCachingSol() {
  const cachingOption = await select<SupportedStateManagementAndCachingSol>({
    message: "Select the state management and caching solution",
    choices: [
      {
        name: "Add Rtk-Query with Redux to the project",
        value: SupportedStateManagementAndCachingSol.RTK_QUERY_REDUX,
      },
      {
        name: "Add React-Query with Axios to the project",
        value: SupportedStateManagementAndCachingSol.REACT_QUERY,
      },
      {
        name: "Add Apollo Graphql Client to the project",
        value: SupportedStateManagementAndCachingSol.GRAPHQL,
      },
      {
        name: "Add Redux thunk with axios",
        value: SupportedStateManagementAndCachingSol.REDUX_THUNK_AXIOS,
      },
      {
        name: "None",
        value: SupportedStateManagementAndCachingSol.NONE,
      },
    ],
  });
  return cachingOption;
}

/**
 * Asynchronously prompts the user to select a supported ui library type, asks additional questions based on the selected type, and adds dependencies to globalStateUtility.
 * @returns A Promise that resolves to the selected ui library type.
 */
export async function getSelectedUiLibrary(
  selectedProjectType: SupportedProjectGenerator,
) {
  const selectedLibrary = await select<SupportedUILibrary>({
    message: "Select the UI Library",
    choices: [
      {
        name: "Add Material UI to the project",
        value: SupportedUILibrary.MUI,
      },
      {
        name: "Add Ant Design to the project",
        value: SupportedUILibrary.ANT_D,
      },
      {
        name: "None",
        value: SupportedUILibrary.NONE,
      },
    ],
  });

  let selectStylingEngine;
  let addMuiIcons;

  if (
    selectedProjectType !== SupportedProjectGenerator.NEXT &&
    selectedLibrary === SupportedUILibrary.MUI
  ) {
    selectStylingEngine = await select<StylingEngineInMui>({
      message: "Which styling engine you want to use for Material UI ?",
      choices: [
        {
          name: "Emotion (Strongly Recommended)",
          value: StylingEngineInMui.EMOTION,
        },
        {
          name: "Styled-components",
          value: StylingEngineInMui.STYLED_COMPONENTS,
        },
      ],
    });

    addMuiIcons = await confirm({
      message: "Do you want to install Material Icons?",
      default: true,
    });

    const dependencies = `${
      selectStylingEngine === "emotion"
        ? "@emotion/styled"
        : "@mui/styled-engine-sc styled-components"
    } @emotion/react ${addMuiIcons ? "@mui/icons-material" : ""}`;

    GlobalStateUtility.getInstance().setDependencies(dependencies);
  }
  return { selectedLibrary, selectStylingEngine, addMuiIcons };
}

/**
 * Asynchronously prompts the user to confirm the addition of i18n.
 * @returns A Promise that resolves to a boolean indicating whether i18n should be added or not.
 */
export async function getI18n() {
  const addI18n = await confirm({
    message: "Do you want to add i18n to the project?",
    default: true,
  });
  return addI18n;
}

/**
 * Asynchronously prompts the user to confirm the addition of testing.
 * @returns A Promise that resolves to a boolean indicating whether testing should be added or not.
 */
export async function getSelectedTesting() {
  const addTesting = await confirm({
    message: "Do you want to add testing to the project ?",
    default: true,
  });
  return addTesting;
}
