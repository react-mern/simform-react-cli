import { FileType, PluginConfigType } from "@/types";

//config for the prettier
let prettierInitialConfig = {
  bracketSpacing: true,
  printWidth: 120,
};

const PrettierPlugin: PluginConfigType = {
  initializingMessage: "Adding Prettier, Please Wait !",
  files: [
    {
      content: JSON.stringify(prettierInitialConfig),
      fileName: ".prettierrc.json",
      fileType: FileType.SIMPLE,
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
