import path from "path";
import fs from "fs";
import cmdRunner from "@/utils/cmdRunner";
import { NodePackageManager, SupportedProjectType } from "@/types";
import getCurrentProject from "@/operation/getProjectType";
import { deleteFile, isFileExists, writeFile } from "@/utils/file";
import { eslintNextConfig, eslintReactConfig } from "./eslintConfig.js";

async function addEslintInProject(currentPackageManager: NodePackageManager) {
  const projectType = getCurrentProject();
  deleteFile(process.cwd(), "eslint");

  //based on project type run the configuration
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addEslintInNext(currentPackageManager);
      break;
    case SupportedProjectType.REACT:
      await addEslintInReact(currentPackageManager);
      break;
    default:
      break;
  }
}

async function addEslintInNext(currentPackageManager: NodePackageManager) {
  //adding eslint config to the project
  const [config, dependencies] = eslintNextConfig(
    isFileExists(process.cwd(), "tsconfig"),
    isFileExists(process.cwd(), "prettier"),
    isFileExists(process.cwd(), ".storybook"),
  );

  //adding config file
  await writeFile(".eslintrc.json", config);

  // installing necessary dependencies
  await cmdRunner(currentPackageManager, [
    `${currentPackageManager === NodePackageManager.NPM ? "install" : "add"}`,
    "-D",
    ...dependencies.split(" "),
  ]);
}

async function addEslintInReact(currentPackageManager: NodePackageManager) {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const hasTypescript = isFileExists(process.cwd(), "tsconfig");

  packageJson.scripts.lint = `eslint . --ext ${
    hasTypescript ? "ts,tsx" : "js,jsx"
  }`;
  packageJson.scripts["lint:fix"] = `eslint . --ext ${
    hasTypescript ? "ts,tsx" : "js,jsx"
  } --fix`;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf8",
  );

  //adding eslint config to the project
  const [config, dependencies] = eslintReactConfig(
    isFileExists(process.cwd(), "tsconfig"),
    isFileExists(process.cwd(), "prettier"),
    isFileExists(process.cwd(), ".storybook"),
    isFileExists(process.cwd(), "vite"),
  );

  //adding config file
  await writeFile(".eslintrc.json", config);

  // installing necessary dependencies
  await cmdRunner(currentPackageManager, [
    `${currentPackageManager === NodePackageManager.NPM ? "install" : "add"}`,
    "-D",
    ...dependencies.split(" "),
  ]);
}

export default addEslintInProject;
