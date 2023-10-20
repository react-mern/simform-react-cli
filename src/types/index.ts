// ================= Types ================= //

// Supported Language Options
export enum SupportedLanguage {
  JS = "js", // JavaScript
  TS = "ts", // TypeScript
}

// Supported Project Generator Options
export enum SupportedProjectGenerator {
  REACT_VITE = "react-vite",
  REACT_CRA = "react-cra", // Create React App
  NEXT = "next", // Next.js
}

// Supported Node Package Manager Options
export enum NodePackageManager {
  NPM = "npm",
  YARN = "yarn",
  PNPM = "pnpm",
}

// Supported Project Type Options
export enum SupportedProjectType {
  REACT = "react",
  NEXT = "next",
}

// Supported UI Library Options
export enum SupportedUILibrary {
  MUI = "mui", // Material-UI
  ANT_D = "antd", // Ant Design
  NONE = "", // None
}

// Supported State Management and Caching Solutions
export enum SupportedStateManagementAndCachingSol {
  RTK_QUERY_REDUX = "rtk-query-redux",
  REACT_QUERY = "react-query",
  GRAPHQL = "graphql",
  NONE = "", // None
}

// Styling Engine Options for Material-UI
export enum StylingEngineInMui {
  EMOTION = "emotion",
  STYLED_COMPONENTS = "styled-components",
}

// Configuration for a React App
export type ReactAppConfig = {
  importStatement?: string;
  name?: string;
  localImport?: string[];
  relativeImport?: string[];
  afterImport?: string[];
  innerHooks?: string[];
  inner?: string[];
  component?: string;
};

// Configuration for a React Index
export type ReactIndexConfig = {
  importStatements: string;
  addBeforeMatch: string;
  addAfterMatch: string;
};

// Configuration for a Next.js Layout
export type NextLayoutConfig = {
  importStatements?: string;
  addBeforeMatch: string;
  addAfterMatch: string;
  innerHooks?: string;
  regex: RegExp;
};

// Configuration for a Next.js Page
export type NextPageConfig = {
  import?: string[];
  provider?: string[];
};

// Configuration for a Plugin Entry in an App
export type PluginAppEntryConfigType =
  | {
      App: ReactAppConfig;
      Index: ReactIndexConfig;
      Layout?: NextLayoutConfig;
      Page?: NextPageConfig;
    }
  | {
      App?: ReactAppConfig;
      Index?: ReactIndexConfig;
      Layout: NextLayoutConfig;
      Page: NextPageConfig;
    };

// Configuration for a React Plugin Entry
export type ReactPluginEntry = {
  App: ReactAppConfig;
  Index: ReactIndexConfig;
};

// Configuration for a Next.js Plugin Entry
export type NextPluginEntry = {
  Layout: NextLayoutConfig;
  Page: NextPageConfig;
};

//FileType for file writing
export enum FileType {
  COMPONENT = "component",
  NATIVE = "native",
  SIMPLE = "simple",
}

// Configuration for Files
export type filesConfig = {
  path: string[];
  content:
    | ((
        isTsProject: boolean,
        projectType?: SupportedProjectGenerator
      ) => string)
    | string;
  fileName: string;
  fileType: FileType;
  // { component => tsx, native => ts, simple => as input }
}[];

// Configuration for a Plugin
export type PluginConfigType = {
  files: filesConfig;
  dependencies?: string | ((isTsProject: boolean) => string);
  devDependencies?: string | ((isTsProject: boolean) => string);
  scripts?:
    | ((isTsProject: boolean) => Record<string, string>)
    | Record<string, string>; // Path is cwd (package.json)
  initializingMessage?: string;
  successMessage?: string;
  fileModification?: PluginAppEntryConfigType;
};
