import { confirm, select } from "@inquirer/prompts";
import {
  StylingEngineInMui,
  SupportedLanguage,
  SupportedProjectGenerator,
  SupportedStateManagementAndCachingSol,
  SupportedUILibrary,
} from "@/types";
import GlobalStateUtility from "@/global/global";

export async function getSelectedLanguage() {
  const selectedLanguage = await select<SupportedLanguage>({
    message: "Select project langugage",
    choices: [
      {
        name: "Typescript (Recommended)",
        value: "ts",
      },
      {
        name: "Javascript",
        value: "js",
      },
    ],
  });

  return selectedLanguage;
}

export async function getSupportedProjectGen() {
  //get the project type from the user
  const selectedProjectType = await select<SupportedProjectGenerator>({
    message: "Select from the option",
    choices: [
      {
        name: "React + Vite (Recommended)",
        value: "react-vite",
      },
      {
        name: "Next Js",
        value: "next",
      },
      {
        name: "React + Webpack (CRA) ",
        value: "react-cra",
      },
    ],
  });
  return selectedProjectType;
}

export async function getSelectedTooling() {
  const addPrettier = await confirm({
    message: "Want to add Prettier in the project ?",
    default: true,
  });

  const addStoryBook = await confirm({
    message: "Want to add Storybook in the project ?",
    default: true,
  });
  const addHusky = await confirm({
    message: "Want to add Husky in the project ?",
    default: true,
  });

  return { addPrettier, addStoryBook, addHusky };
}

export async function getSelectedStateManagementAndCachingSol() {
  const cachingOption = await select<SupportedStateManagementAndCachingSol>({
    message: "Select to continue",
    choices: [
      {
        name: "Add Rtk-Query with Redux in the project",
        value: "rtk-query-redux",
      },
      {
        name: "Add React-Query with Axios in the project",
        value: "react-query",
      },
      {
        name: "Add Apollo Graphql Client in the project",
        value: "graphql",
      },
      {
        name: "None",
        value: "",
      },
    ],
  });
  return cachingOption;
}

export async function getSelectedUiLibrary(
  selectedProjectType: SupportedProjectGenerator
) {
  const selectedLibrary = await select<SupportedUILibrary>({
    message: "Select to continue",
    choices: [
      {
        name: "Add Material UI in the project",
        value: "mui",
      },
      {
        name: "Add Ant Design in the project",
        value: "antd",
      },
      {
        name: "None",
        value: "",
      },
    ],
  });

  let selectStylingEngine;
  let addMuiIcons;

  if (selectedProjectType !== "next" && selectedLibrary) {
    selectStylingEngine = await select<StylingEngineInMui>({
      message: "Which styling engine you want to use for Material UI ?",
      choices: [
        {
          name: "Emotion (Strongly Recommended)",
          value: "emotion",
        },
        {
          name: "Styled-components",
          value: "styled-components",
        },
      ],
    });

    addMuiIcons = await confirm({
      message: "Would you like to install Material Icons ?",
      default: true,
    });

    const dependencies = `${
      selectStylingEngine === "emotion"
        ? "@emotion/react @emotion/styled"
        : "@mui/styled-engine-sc styled-components"
    } ${addMuiIcons ? "@mui/icons-material" : ""}`;

    GlobalStateUtility.getInstance().setDependencies(dependencies);
  }
  return { selectedLibrary, selectStylingEngine, addMuiIcons };
}

export async function getI18n() {
  const addI18n = await confirm({
    message: "Want to add i18n in the project ?",
    default: true,
  });
  return addI18n;
}
