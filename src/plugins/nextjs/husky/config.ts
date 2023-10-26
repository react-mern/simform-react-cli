import GlobalStateUtility from "@/global";
import { FileType, NodePackageManager, PluginConfigType } from "@/types";
import { isFileExists } from "@/utils/file";

function getLintStatedRcContent() {
  const currentPackageManager =
    GlobalStateUtility.getInstance().getCurrentPackageManager();

  const prefixForCmd = `${currentPackageManager} ${
    currentPackageManager === NodePackageManager.NPM ? "run " : ""
  }`;

  const hasPrettier = isFileExists(process.cwd(), "prettier");

  const lintingScript =
    "const path = require('path');\nconst buildEslintCommand = (filenames) => `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`;";

  return (
    lintingScript +
    `\nmodule.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand,"${
    hasPrettier ? `${prefixForCmd} format` : ""
  }"],
};`
  );
}
const HuskyNextPlugin: PluginConfigType = {
  initializingMessage: "Adding Husky ! Please wait.. ",
  files: [
    {
      content: getLintStatedRcContent,
      fileName: ".lintstagedrc.js",
      fileType: FileType.SIMPLE,
      path: [],
    },
  ],
  successMessage: "Successfully added Husky !",
};

export default HuskyNextPlugin;
