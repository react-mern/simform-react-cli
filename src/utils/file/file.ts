import fs, { readdirSync, unlinkSync } from "fs";
import path from "path";
import {
  PluginConfigType,
  ReactIndexConfig,
  ReactPluginEntry,
  NextPluginEntry,
  SupportedProjectGenerator,
  NodePackageManager,
  FileType,
} from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import GlobalStateUtility from "@/global";
import logger, { initiatorLog } from "@/utils/logger";
import { addProviderAndImports } from "@/utils/fileManipulation";
import { getRegexForRootComponent } from "@/utils/fileManipulation";
import { homePageContent, homePageCss } from "./reactPluginConfig";

/**
 * Checks whether the directory is empty or not.
 * @param  path - The path to the directory to be checked.
 * @returns  - Returns `true` if the directory is empty, `false` if it contains files or subdirectories.
 */
export function isEmptyDir(path: string) {
  try {
    return fs.readdirSync(path).length === 0;
  } catch (error) {
    /** */
  }
  return true;
}

/**
 * Checks whether the required file is present in the current directory or not.
 * @param filepath - The path of the directory to be checked.
 * @param file - The file name that we want to check.
 * @returns - Returns `true` if the file is found, `false` if it is not found.
 */
export function isFileExists(filepath: string, file: string) {
  const fileList: boolean =
    readdirSync(filepath).some((val: string) => {
      return val.includes(file);
    }) || false;
  return fileList;
}

/**
 * Delete the file from the specified directory path.
 * @param filepath - The path of the directory from which the file should be deleted.
 * @param file - The name of the file that you want to delete.
 */
export function deleteFile(filepath: string, file: string) {
  readdirSync(filepath).some((val: string) => {
    if (val.includes(file)) {
      unlinkSync(path.join(filepath, "/", val)); // delete the file if it exists
      return true;
    }
    return false;
  });
}

/**
 * Recursively searches for a file with the specified name in a given directory and its subdirectories.
 * @param directory - The base directory to start the search from.
 * @param fileName - The name of the file to search for.
 * @returns Object | null  - An object with information about the found file, or null if the file is not found.
 *   - filePath: The full path to the found file, including the directory.
 *   - file: The name of the found file.
 *   - If the file is not found, the function returns null.
 */
export function findFileRecursively(
  directory: string,
  fileName: string,
): { filePath: string; file: string } | null {
  // Read the contents of the current directory
  const files = fs.readdirSync(directory);

  // Iterate through each item in the directory
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, recursively search inside it
      const foundFile = findFileRecursively(filePath, fileName);
      if (foundFile) {
        // If a file is found in the subdirectory, return it
        return foundFile;
      }
    } else if (file.includes(fileName)) {
      return { filePath, file };
    }
  }

  return null; // File not found in the directory or its subdirectories
}

/**
 * Writes a file at the specified location with the given content.
 * @param fileName - The name of the file.
 * @param content - The content that will be added to the file.
 * @param filePath - The path at which the file will be created. If the directory does not exist, it will be created; otherwise, the default path is the root directory.
 */
export function writeFile(
  fileName: string,
  content: string,
  filePath?: string,
) {
  const writeFilePath = filePath
    ? path.join(filePath, fileName)
    : path.join(process.cwd(), fileName);
  if (path)
    try {
      filePath && fs.mkdirSync(filePath, { recursive: true });

      fs.writeFileSync(writeFilePath, content, "utf8");
    } catch (error) {
      console.log(error);
    }
}

/**
 * Checks if the project exists or not with the help of the presence of a package.json file.
 * If the package.json file is not present, then it forces the process to exit.
 */
export async function isProjectExists() {
  const isProjectDir = isFileExists(process.cwd(), "package.json");
  if (!isProjectDir) {
    logger(
      "red",
      "Please initialize project in current working directory to install !",
    );
    process.exit(1);
  }
}

/**
 * Moves all files from a specified root directory to a subdirectory within it.
 * If the subdirectory does not exist, it will be created.
 * @param rootDir - The root directory containing the files to be moved.
 * @param subDir - The name of the subdirectory where the files will be moved to.
 */
export function moveAllFilesToSubDir(rootDir: string, subDir: string) {
  const subDirPath = path.join(rootDir, subDir);

  //if not then create one
  if (!fs.existsSync(subDirPath)) {
    fs.mkdirSync(subDirPath);
  }

  fs.readdirSync(rootDir).forEach((file) => {
    const oldPath = path.join(rootDir, file);
    const newPath = path.join(subDirPath, file);

    if (!file.includes(subDir)) {
      fs.renameSync(oldPath, newPath);
    }
  });
}

/**
 * Asynchronously writes files and performs various tasks based on a provided configuration.
 * @param baseConfig - Configuration object specifying how to write files and perform actions.
 */
export async function writeFileFromConfig(baseConfig: PluginConfigType) {
  // If an initializing message is provided in the configuration, log it
  if (baseConfig?.initializingMessage)
    initiatorLog(baseConfig.initializingMessage);

  // Check if the project is a TypeScript project by the presence of "tsconfig.json"
  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");

  // Get the current package manager from the global state utility
  const globalInstance = GlobalStateUtility.getInstance();

  // Get the project type from the global instance
  const projectType = globalInstance.getCurrentProjectGenType();

  // Define file extension types based on whether it's a TypeScript project
  const fileType = isTsProject
    ? { component: "tsx", native: "ts" }
    : { component: "jsx", native: "js" };

  //writing file from base config
  baseConfig.files.forEach((fileDetail) => {
    const content =
      typeof fileDetail.content === "function"
        ? fileDetail.content(isTsProject, projectType)
        : fileDetail.content;

    const fileName =
      fileDetail.fileType !== FileType.SIMPLE
        ? `${fileDetail.fileName}.${fileType[fileDetail.fileType]}`
        : fileDetail.fileName;

    writeFile(fileName, content, path.join(process.cwd(), ...fileDetail.path));
  });

  // If there are file modifications defined in the configuration, set them in the global state
  if (baseConfig?.fileModification) {
    globalInstance.setPluginAppEntryConfig(baseConfig.fileModification);
  }

  // Install dependencies if they exist in the configuration
  if (baseConfig?.dependencies) {
    const dependencies =
      typeof baseConfig.dependencies === "function"
        ? baseConfig.dependencies(isTsProject)
        : baseConfig.dependencies;

    GlobalStateUtility.getInstance().setDevDependencies(dependencies);
  }

  // Install devDependencies if they exist in the configuration
  if (baseConfig?.devDependencies) {
    const devDependencies =
      typeof baseConfig.devDependencies === "function"
        ? baseConfig.devDependencies(isTsProject)
        : baseConfig.devDependencies;

    GlobalStateUtility.getInstance().setDevDependencies(devDependencies);
  }

  // Add scripts to the package.json if they exist in the configuration
  if (baseConfig?.scripts) {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const scripts =
      typeof baseConfig.scripts === "function"
        ? baseConfig.scripts(isTsProject)
        : baseConfig.scripts;

    for (const key in scripts) {
      if (Object.prototype.hasOwnProperty.call(scripts, key)) {
        packageJson.scripts[key] = scripts[key];
      }
    }
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8",
    );
  }

  // If a success message is provided in the configuration, log it in green color
  if (baseConfig.successMessage) logger("green", baseConfig.successMessage);
}

/**
 * Changes the directory to the generated project name and detects if the directory exists.
 * If the directory does not exist, it forces an exit.
 */
export async function changeDirAndDetectProject() {
  // Get the project name from the global state utility
  const projectName = GlobalStateUtility.getInstance().getProjectName();
  try {
    // Change the current working directory to the project name
    process.chdir(projectName);
    // Check if the project directory exists
    await isProjectExists();
  } catch (error) {
    // If an error occurs, force an exit with an exit code of 1
    process.exit(1);
  }
}

/**
 * Installs dependencies obtained from the GlobalStateUtility.
 * This function installs both regular dependencies and devDependencies.
 */
export async function pluginDependencyAdder() {
  //after adding plugin installing all the remaining dependencies
  const globalInstance = GlobalStateUtility.getInstance();

  const dependencies = globalInstance.getDependencies();

  const currentPackageManager = globalInstance.getCurrentPackageManager();

  const devDependencies = globalInstance.getDevDependencies();

  try {
    if (dependencies) {
      const dependenciesArr = dependencies.split(" ").filter((str) => {
        if (str) return str;
      });

      await cmdRunner(currentPackageManager, [
        `${
          currentPackageManager === NodePackageManager.NPM ? "install" : "add"
        }`,
        ...dependenciesArr,
      ]);
    }

    if (devDependencies) {
      const devDependenciesArr = devDependencies.split(" ").filter((str) => {
        if (str) return str;
      });

      await cmdRunner(currentPackageManager, [
        `${
          currentPackageManager === NodePackageManager.NPM ? "install" : "add"
        }`,
        "-D",
        ...devDependenciesArr,
      ]);
    }
  } catch (error) {
    /** */
  }
}

/**
 * Adds the plugin's entry code into the project based on the project type.
 */
export async function pluginEntryAdder() {
  const globalInstance = GlobalStateUtility.getInstance();

  const pluginConfigArr = globalInstance.getPluginAppEntryConfig();

  const currentProjectType = globalInstance.getCurrentProjectGenType();

  switch (currentProjectType) {
    case SupportedProjectGenerator.NEXT:
      await pluginEntryAdderInNext(pluginConfigArr.next);
      break;
    case SupportedProjectGenerator.REACT_CRA:
    case SupportedProjectGenerator.REACT_VITE:
      await pluginEntryAdderInReact(pluginConfigArr.react);
      break;
    default:
      break;
  }
}

/**
 * Adds plugin entry code to a React project.
 * @param pluginConfigArr - Configuration for React-based projects.
 */
async function pluginEntryAdderInReact(pluginConfigArr: ReactPluginEntry[]) {
  // Determine if it's a Vite project or a TypeScript project
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");
  const rootPath = path.join(process.cwd(), "src");

  // Find the root component file and the entry file
  const detectRootComponentFile = findFileRecursively(rootPath, "App");

  const detectEntryFile = findFileRecursively(
    rootPath,
    `${isViteProject ? "main" : `index.${isTsProject ? "tsx" : "js"}`}`,
  );

  if (!detectRootComponentFile || !detectEntryFile) return;

  const rootComponent = detectRootComponentFile.file;
  const rootEntryFilePath = detectEntryFile.filePath;

  const regex = getRegexForRootComponent(
    rootComponent.substring(0, rootComponent.indexOf(".")),
  );

  const initialValue: ReactIndexConfig = {
    importStatements: "",
    addAfterMatch: "",
    addBeforeMatch: "",
  };

  // Combine import statements and placement settings from the configuration
  const importAndProviderValues = pluginConfigArr.reduce((prev, curr) => {
    const { importStatements, addAfterMatch, addBeforeMatch } = curr.Index;

    prev.importStatements = prev?.importStatements + importStatements + "\n";
    prev.addAfterMatch = addAfterMatch + prev?.addAfterMatch;
    prev.addBeforeMatch = prev?.addBeforeMatch + addBeforeMatch;

    return prev;
  }, initialValue);

  // Add imports and providers to the root entry file
  await addProviderAndImports(
    rootEntryFilePath,
    importAndProviderValues.importStatements,
    regex,
    importAndProviderValues.addBeforeMatch,
    importAndProviderValues.addAfterMatch,
  );

  //========== Adding generated example in home file =============//

  const initialValueComponentValue: {
    importStatement: string;
    component: { name: string; component: string }[];
  } = {
    importStatement: "",
    component: [],
  };

  // Combine import statements and component information from the configuration
  const importAndComponentValues = pluginConfigArr.reduce((prev, curr) => {
    const { importStatement, name, component } = curr.App;

    if (importStatement && name && component) {
      prev.importStatement += "\n" + importStatement ?? "";
      prev.component.push({ name, component });
    }

    return prev;
  }, initialValueComponentValue);

  // Generate content for the home page
  const HomePageContent =
    importAndComponentValues.importStatement +
    "\n" +
    homePageContent(isTsProject, importAndComponentValues.component);

  const homePagePath = path.join(process.cwd(), "src", "components", "home");

  // Write the home page content and its CSS
  writeFile(
    `Home.${isTsProject ? "tsx" : "jsx"}`,
    HomePageContent,
    homePagePath,
  );
  writeFile("Home.module.css", homePageCss, homePagePath);
}

/**
 * Adds plugin entry code to a Next.js project.
 * @param pluginConfigArr - Configuration for Next.js-based projects.
 */
async function pluginEntryAdderInNext(pluginConfigArr: NextPluginEntry[]) {
  const detectedFile = findFileRecursively(
    path.join(process.cwd(), "src", "app"),
    "layout",
  );

  if (!detectedFile) return;

  // Iterate through the configuration and add imports and code based on each configuration entry
  pluginConfigArr.forEach(async (curr) => {
    const { importStatements, addAfterMatch, addBeforeMatch, regex } =
      curr.Layout;
    await addProviderAndImports(
      detectedFile.filePath,
      importStatements ?? "",
      regex,
      addBeforeMatch,
      addAfterMatch,
    );
  });
}

/**
 * JSON parser that parses JSON with comments.
 * @param jsonString - A string that contains a JSON object with comments.
 * @returns - The parsed JSON object after removing comments.
 */
export function parseJsonWithComments(jsonString: string) {
  const commentsRegExp = /\/\/.*|\/\*[^]*?\*\//g;
  const cleanedJsonString = jsonString.replace(commentsRegExp, "");
  return JSON.parse(cleanedJsonString);
}
