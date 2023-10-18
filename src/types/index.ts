//================ types =================//

export type SupportedLanguage = "ts" | "js";

export type SupportedProjectGenerator = "react-vite" | "react-cra" | "next";

export type NodePackageManager = "npm" | "yarn" | "pnpm";

export type SupportedProjectType = "react" | "next";

export type SupportedUILibrary = "mui" | "antd" | "";

export type SupportedStateManagementAndCachingSol =
  | "rtk-query-redux"
  | "react-query"
  | "graphql"
  | "";

export type StylingEngineInMui = "emotion" | "styled-components";

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

export type ReactIndexConfig = {
  importStatements: string;
  addBeforeMatch: string;
  addAfterMatch: string;
};

export type NextLayoutConfig = {
  importStatements?: string;
  addBeforeMatch: string;
  addAfterMatch: string;
  innerHooks?: string;
  regex: RegExp;
};

export type NextPageConfig = {
  import?: string[];
  provider?: string[];
};

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

export type ReactPluginEntry = {
  App: ReactAppConfig;
  Index: ReactIndexConfig;
};

export type NextPluginEntry = {
  Layout: NextLayoutConfig;
  Page: NextPageConfig;
};

export type filesConfig = {
  path: string[];
  content:
    | ((
        isTsProject: boolean,
        projectType?: SupportedProjectGenerator
      ) => string)
    | string;
  fileName: string;
  fileType: "component" | "native" | "simple"; //{ component => tsx, native => ts , simple => as input}
}[];

export type PluginConfigType = {
  files: filesConfig;
  dependencies?: string | ((isTsProject: boolean) => string);
  devDependencies?: string | ((isTsProject: boolean) => string);
  scripts?:
    | ((isTsProject: boolean) => Record<string, string>)
    | Record<string, string>; //path is cwd (package.json)
  initializingMessage?: string;
  successMessage?: string;
  fileModification?: PluginAppEntryConfigType;
};
