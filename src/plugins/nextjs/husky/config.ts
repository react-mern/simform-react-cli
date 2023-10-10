import GlobalStateUtility from "@/global";
import { PluginConfigType } from "@/types";
import { isFileExists } from "@/utils/file";

function getLintStatedRcContent(isTsProject: boolean) {
  const currentPackageManager =
    GlobalStateUtility.getInstance().getCurrentPackageManager();

  const prefixForCmd = `${currentPackageManager} ${
    currentPackageManager === "npm" ? "run " : ""
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
  files: [
    {
      content: getLintStatedRcContent,
      fileName: ".lintstagedrc.js",
      fileType: "simple",
      path: [],
    },
  ],
};

export default HuskyNextPlugin;
