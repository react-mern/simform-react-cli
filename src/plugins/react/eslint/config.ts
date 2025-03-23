import { FileType, PluginConfigType } from "@/types";

const EslintConfig = (
  isTsProject: boolean,
) => `import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
${isTsProject ? `import tseslint from "typescript-eslint";` : ""}
import pluginReact from "eslint-plugin-react";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  ${isTsProject ? `tseslint.configs.recommended,` : ``}
  pluginReact.configs.flat.recommended,
]);`;

const EslintReactPlugin: PluginConfigType = {
  initializingMessage: "Adding Eslint, Please wait !",
  devDependencies: (isTsProject: boolean) =>
    `eslint eslint-plugin-react ${isTsProject ? "typescript-eslint" : ""}`,
  files: [
    {
      content: EslintConfig,
      fileName: "eslint.config.js",
      fileType: FileType.SIMPLE,
      path: [],
    },
  ],
  successMessage: "Successfully added Eslint!",
};

export default EslintReactPlugin;
