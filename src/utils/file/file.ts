import fs, { readdirSync, unlinkSync } from "fs";
import path from "path";
import {
  PluginConfigType,
  ReactIndexConfig,
  ReactPluginEntry,
  NextPluginEntry,
} from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import GlobalStateUtility from "@/global";
import logger, { initiatorLog } from "@/utils/logger";
import { addProviderAndImports } from "@/utils/fileManipulation";
import { getRegexForRootComponent } from "@/utils/fileManipulation";
import { homePageContent, homePageCss } from "./reactPluginConfig";

//gives directory empty or not
export function isEmptyDir(path: string) {
  try {
    return fs.readdirSync(path).length === 0;
  } catch (error) {}
  return true;
}

//gives file exists or not
export function isFileExists(filepath: string, file: string) {
  const fileList: boolean =
    readdirSync(filepath).some((val: string) => {
      return val.includes(file);
    }) || false;
  return fileList;
}

//delete file if it exists
export function deleteFile(filepath: string, file: string) {
  readdirSync(filepath).some((val: string) => {
    if (val.includes(file)) {
      unlinkSync(path.join(filepath, "/", val)); // delete the file if it exists
      return true;
    }
    return false;
  });
}

export function findFileRecursively(
  directory: string,
  fileName: string
): { filePath: string; file: string } | null {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, recursively search inside it
      const foundFile = findFileRecursively(filePath, fileName);
      if (foundFile) {
        return foundFile;
      }
    } else if (file.includes(fileName)) {
      return { filePath, file };
    }
  }

  return null; // File not found in the directory or its subdirectories
}

//writes file with given content
export function writeFile(fileName: string, content: any, filePath?: string) {
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

export async function isProjectExists() {
  const isProjectDir = isFileExists(process.cwd(), "package.json");
  if (!isProjectDir) {
    logger(
      "red",
      "Please initialize project in current working directory to install !"
    );
    process.exit(1);
  }
}

export async function isConfigExists(configName: string) {
  const isConfigExist = isFileExists(process.cwd(), configName);
  if (isConfigExist) {
    logger("red", `${configName} already exist in the project`);
    process.exit(1);
  }
}

export function moveAllFilesToSubDir(rootDir: string, subDir: string) {
  const subDirPath = path.join(rootDir, subDir);

  //if not then create one
  if (!fs.existsSync(subDirPath)) {
    fs.mkdirSync(subDirPath);
  }

  fs.readdirSync(rootDir).forEach(file => {
    const oldPath = path.join(rootDir, file);
    const newPath = path.join(subDirPath, file);

    if (!file.includes(subDir)) {
      fs.renameSync(oldPath, newPath);
    }
  });
}

export async function writeFileFromConfig(baseConfig: PluginConfigType) {
  if (baseConfig?.initializingMessage)
    initiatorLog(baseConfig.initializingMessage);

  //check if ts project or not
  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");

  //getting currentPackageManager from global state utility
  const globalInstance = GlobalStateUtility.getInstance();

  const projectType = globalInstance.getCurrentProjectGenType();

  //file extension type
  const fileType = isTsProject
    ? { component: "tsx", native: "ts" }
    : { component: "jsx", native: "js" };

  //writing file from base config
  baseConfig.files.forEach(fileDetail => {
    const content =
      typeof fileDetail.content === "function"
        ? fileDetail.content(isTsProject, projectType)
        : fileDetail.content;

    const fileName =
      fileDetail.fileType !== "simple"
        ? `${fileDetail.fileName}.${fileType[fileDetail.fileType]}`
        : fileDetail.fileName;

    writeFile(fileName, content, path.join(process.cwd(), ...fileDetail.path));
  });

  if (baseConfig?.fileModification) {
    globalInstance.setPluginAppEntryConfig(baseConfig.fileModification);
  }

  //installing dependencies if exists
  if (baseConfig?.dependencies) {
    const dependencies =
      typeof baseConfig.dependencies === "function"
        ? baseConfig.dependencies(isTsProject)
        : baseConfig.dependencies;

    GlobalStateUtility.getInstance().setDevDependencies(dependencies);
  }

  //installing devDependencies if exists
  if (baseConfig?.devDependencies) {
    const devDependencies =
      typeof baseConfig.devDependencies === "function"
        ? baseConfig.devDependencies(isTsProject)
        : baseConfig.devDependencies;

    GlobalStateUtility.getInstance().setDevDependencies(devDependencies);
  }

  //adding scripts in package json
  if (baseConfig?.scripts) {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const scripts =
      typeof baseConfig.scripts === "function"
        ? baseConfig.scripts(isTsProject)
        : baseConfig.scripts;

    for (const key in scripts) {
      if (scripts.hasOwnProperty(key)) {
        packageJson.scripts[key] = scripts[key];
      }
    }
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8"
    );
  }

  if (baseConfig.successMessage) logger("green", baseConfig.successMessage);
}

export async function changeDirAndDetectProject() {
  const projectName = GlobalStateUtility.getInstance().getProjectName();
  try {
    process.chdir(projectName);
    await isProjectExists();
  } catch (error) {
    process.exit(1);
  }
}

export async function pluginDependencyAdder() {
  //after adding plugin installing all the remaining dependencies
  const globalInstance = GlobalStateUtility.getInstance();

  const dependencies = globalInstance.getDependencies();

  const currentPackageManager = globalInstance.getCurrentPackageManager();

  const devDependencies = globalInstance.getDevDependencies();

  try {
    if (dependencies) {
      const dependenciesArr = dependencies.split(" ").filter(str => {
        if (str) return str;
      });

      await cmdRunner(currentPackageManager, [
        `${currentPackageManager === "npm" ? "install" : "add"}`,
        ...dependenciesArr,
      ]);
    }

    if (devDependencies) {
      const devDependenciesArr = devDependencies.split(" ").filter(str => {
        if (str) return str;
      });

      await cmdRunner(currentPackageManager, [
        `${currentPackageManager === "npm" ? "install" : "add"}`,
        "-D",
        ...devDependenciesArr,
      ]);
    }
  } catch (error) {}
}

export async function pluginEntryAdder() {
  const globalInstance = GlobalStateUtility.getInstance();

  const pluginConfigArr = globalInstance.getPluginAppEntryConfig();

  const currentProjectType = globalInstance.getCurrentProjectGenType();

  switch (currentProjectType) {
    case "next":
      await pluginEntryAdderInNext(pluginConfigArr.next);
      break;
    case "react-cra":
      await pluginEntryAdderInReact(pluginConfigArr.react);
      break;
    case "react-vite":
      await pluginEntryAdderInReact(pluginConfigArr.react);
      break;
    default:
      break;
  }
}

async function pluginEntryAdderInReact(pluginConfigArr: ReactPluginEntry[]) {
  const isViteProject = isFileExists(process.cwd(), "vite.config");

  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");

  const rootPath = path.join(process.cwd(), "src");

  const detectRootComponentFile = findFileRecursively(rootPath, "App");

  const detectEntryFile = findFileRecursively(
    rootPath,
    `${isViteProject ? "main" : `index.${isTsProject ? "tsx" : "js"}`}`
  );

  if (!detectRootComponentFile || !detectEntryFile) return;

  const rootComponent = detectRootComponentFile.file;
  const rootEntryFilePath = detectEntryFile.filePath;

  const regex = getRegexForRootComponent(
    rootComponent.substring(0, rootComponent.indexOf("."))
  );

  const initialValue: ReactIndexConfig = {
    importStatements: "",
    addAfterMatch: "",
    addBeforeMatch: "",
  };

  const importAndProviderValues = pluginConfigArr.reduce((prev, curr) => {
    const { importStatements, addAfterMatch, addBeforeMatch } = curr.Index;

    prev.importStatements = prev?.importStatements + importStatements + "\n";
    prev.addAfterMatch = addAfterMatch + prev?.addAfterMatch;
    prev.addBeforeMatch = prev?.addBeforeMatch + addBeforeMatch;

    return prev;
  }, initialValue);

  await addProviderAndImports(
    rootEntryFilePath,
    importAndProviderValues.importStatements,
    regex,
    importAndProviderValues.addBeforeMatch,
    importAndProviderValues.addAfterMatch
  );

  //========== Adding generated example in home file =============//
  const initialValueComponentValue: {
    importStatement: string;
    component: { name: string; component: string }[];
  } = {
    importStatement: "",
    component: [],
  };

  const importAndComponentValues = pluginConfigArr.reduce((prev, curr) => {
    const { importStatement, name, component } = curr.App;

    if (importStatement && name && component) {
      prev.importStatement += "\n" + importStatement ?? "";
      prev.component.push({ name, component });
    }

    return prev;
  }, initialValueComponentValue);

  const HomePageContent =
    importAndComponentValues.importStatement +
    "\n" +
    homePageContent(isTsProject, importAndComponentValues.component);

  const homePagePath = path.join(process.cwd(), "src", "components", "home");

  writeFile(
    `Home.${isTsProject ? "tsx" : "jsx"}`,
    HomePageContent,
    homePagePath
  );

  writeFile("Home.module.css", homePageCss, homePagePath);
}

async function pluginEntryAdderInNext(pluginConfigArr: NextPluginEntry[]) {
  const detectedFile = findFileRecursively(
    path.join(process.cwd(), "src", "app"),
    "layout"
  );

  if (!detectedFile) return;

  pluginConfigArr.forEach(async curr => {
    const { importStatements, addAfterMatch, addBeforeMatch, regex } =
      curr.Layout;
    await addProviderAndImports(
      detectedFile.filePath,
      importStatements ?? "",
      regex,
      addBeforeMatch,
      addAfterMatch
    );
  });
}
