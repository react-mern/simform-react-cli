import {
  NodePackageManager,
  SupportedLanguage,
  SupportedProjectGenerator,
  PluginAppEntryConfigType,
  ReactPluginEntry,
  NextPluginEntry,
} from "@/types";

class GlobalStateUtility {
  private static instance: GlobalStateUtility;
  private CurrentPackageManager!: NodePackageManager;
  private ProjectName!: string;
  private CurrentLanguage!: SupportedLanguage;
  private selectedProjectType!: SupportedProjectGenerator;
  private configurations: {
    react: ReactPluginEntry[];
    next: NextPluginEntry[];
  } = {
    react: [],
    next: [],
  };
  private dependencies: string = "";
  private devDependencies: string = "";

  private constructor() {}

  static initializeInstance(
    nodePackageManager: NodePackageManager,
    projectName: string,
    currentLanguage: SupportedLanguage,
    currentProjectType: SupportedProjectGenerator,
    configuration?: PluginAppEntryConfigType
  ): GlobalStateUtility {
    if (!GlobalStateUtility.instance) {
      GlobalStateUtility.instance = new GlobalStateUtility();
      GlobalStateUtility.instance.initialize(
        nodePackageManager,
        projectName,
        currentLanguage,
        currentProjectType,
        configuration
      );
    }
    return GlobalStateUtility.instance;
  }

  private initialize(
    nodePackageManager: NodePackageManager,
    projectName: string,
    currentLanguage: SupportedLanguage,
    currentProjectType: SupportedProjectGenerator,
    configuration?: PluginAppEntryConfigType
  ): void {
    this.CurrentPackageManager = nodePackageManager;
    this.ProjectName = projectName;
    this.CurrentLanguage = currentLanguage;
    this.selectedProjectType = currentProjectType;
  }

  static getInstance() {
    if (!GlobalStateUtility.instance)
      throw Error(
        "\nGlobalStateUtility instance not found ! Please initialize it to get the instance."
      );
    return GlobalStateUtility.instance;
  }

  getProjectName(): string {
    return this.ProjectName;
  }

  getCurrentPackageManager(): NodePackageManager {
    return this.CurrentPackageManager;
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.CurrentLanguage;
  }

  getCurrentProjectGenType(): SupportedProjectGenerator {
    return this.selectedProjectType;
  }

  setPluginAppEntryConfig(config: ReactPluginEntry | NextPluginEntry) {
    if ("App" in config && "Index" in config) {
      this.configurations.react.push(config);
    }

    if ("Layout" in config && "Page" in config) {
      this.configurations.next.push(config);
    }
  }

  getPluginAppEntryConfig() {
    return this.configurations;
  }

  setDependencies(dependencies: string) {
    this.dependencies += dependencies + " ";
  }

  getDependencies() {
    return this.dependencies;
  }

  setDevDependencies(devDependencies: string) {
    this.devDependencies += devDependencies + " ";
  }

  getDevDependencies() {
    return this.devDependencies;
  }
}

export default GlobalStateUtility;
