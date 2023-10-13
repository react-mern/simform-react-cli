import { PluginConfigType } from "@/types";

//config for the prettier
let prettierInitialConfig = {
  singleQuote: false,
  bracketSpacing: true,
  printWidth: 120,
};

const PrettierPlugin: PluginConfigType = {
  initializingMessage: "Adding Prettier, Please Wait !",
  files: [
    {
      content: JSON.stringify(prettierInitialConfig),
      fileName: ".prettierrc.json",
      fileType: "simple",
      path: [],
    },
  ],
  scripts: function (isTsProject: boolean) {
    return {
      format: `prettier --write ${
        isTsProject ? "--parser typescript '**/*.{ts,tsx}'" : "'**/*.{js,jsx}'"
      }`,
    };
  },
  devDependencies: "prettier",
  successMessage: "Successfully added Prettier !",
};

export default PrettierPlugin;
