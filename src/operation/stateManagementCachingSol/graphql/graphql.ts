import path from "path";
import fs from "fs";
import { NodePackageManager, SupportedProjectType } from "@/types";
import { isFileExists, writeFile, writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import cmdRunner from "@/utils/cmdRunner";
import GlobalStateUtility from "@/global";
import GraphQlNextPlugin from "@/plugins/nextjs/graphql";
import GraphQlReactPlugin from "@/plugins/react/graphql";

export default async function addGraphQL() {
  const currentPackageManager =
    GlobalStateUtility.getInstance().getCurrentPackageManager();

  const projectType = getCurrentProject();

  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");

  //based on the project type run the configuration to install
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addGraphQLInNext();
      break;
    case SupportedProjectType.REACT:
      await addGraphQLInReact();
      break;
    default:
      break;
  }

  if (isTsProject) {
    await codegenAdder(currentPackageManager);
  }
}

async function addGraphQLInNext() {
  await writeFileFromConfig(GraphQlNextPlugin);
}

async function addGraphQLInReact() {
  await writeFileFromConfig(GraphQlReactPlugin);
}

const reactCodeGenConfig = `import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://rickandmortyapi.com/graphql",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
`;

//codegen adder if the typescript project
async function codegenAdder(currentPackageManager: NodePackageManager) {
  const codegenDependencies = `@graphql-codegen/cli @graphql-codegen/client-preset @graphql-typed-document-node/core`;

  await cmdRunner(currentPackageManager, [
    `${currentPackageManager === NodePackageManager.NPM ? "install" : "add"}`,
    "-D",
    ...codegenDependencies.split(" "),
  ]);

  writeFile("codegen.ts", reactCodeGenConfig, process.cwd());

  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.scripts["codegen:compile"] = "graphql-codegen";
  packageJson.scripts["codegen:watch"] = "graphql-codegen -w";

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf-8",
  );

  const codegenCmd =
    currentPackageManager === NodePackageManager.NPM
      ? ["run", "codegen:compile"]
      : ["codegen:compile"];

  await cmdRunner(currentPackageManager, codegenCmd);
}
