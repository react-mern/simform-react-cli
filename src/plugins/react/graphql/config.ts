import { FileType, PluginConfigType, SupportedProjectGenerator } from "@/types";
import { isFileExists } from "@/utils/file";

const envExFile = () => {
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  return `${isViteProject ? "VITE_APP" : "REACT_APP"}_BASE_URL`;
};

const getEnvConfig = () => {
  const prefix = envExFile();
  return prefix + "=https://rickandmortyapi.com/graphql";
};

const reactGraphqlClientConfig = (
  isTsProject: boolean,
  projectType?: SupportedProjectGenerator,
) => `import { ApolloClient, InMemoryCache } from "@apollo/client";

${
  projectType === SupportedProjectGenerator.REACT_VITE
    ? "const environment = import.meta.env;"
    : ""
}

const client = new ApolloClient({
  uri: ${
    projectType === SupportedProjectGenerator.REACT_VITE
      ? "environment.VITE_APP_BASE_URL"
      : projectType === SupportedProjectGenerator.REACT_CRA
      ? "process.env.REACT_APP_BASE_URL"
      : ""
  },
  cache: new InMemoryCache(),
});

export default client;
`;

export const getExampleComponentReact = (isTsProject: boolean) =>
  `import React from "react";
import { useQuery${isTsProject ? "" : ", gql"} } from "@apollo/client";
${isTsProject ? `import { gql } from "src/__generated__";` : ""}

const GET_CHARACTERS = gql${isTsProject ? "(/* GraphQL */ " : ""}+=+
  query Get_Characters {
    characters {
      results {
        id
        name
        image
      }
    }
  }
+=+${isTsProject ? ")" : ""};

const Characters = () => {
  const { loading, error, data } = useQuery(GET_CHARACTERS);

  if (loading) return <div>Loading....</div>;
  if (error) return <div>error occurred</div>;

  return (
    <div>
      {data?.characters?.results?.map((character) => {
        return <div key={character?.id}>{character?.name}</div>;
      })}
    </div>
  );
};

export default Characters;
`.replaceAll("+=+", "`");

const GraphQlReactPlugin: PluginConfigType = {
  initializingMessage: "Adding GraphQL ! Please wait.. ",
  files: [
    {
      content: getEnvConfig,
      fileName: ".env",
      fileType: FileType.SIMPLE,
      path: [],
    },
    {
      content: envExFile,
      fileName: ".env.example",
      fileType: FileType.SIMPLE,
      path: [],
    },
    {
      content: reactGraphqlClientConfig,
      fileName: "client",
      fileType: FileType.NATIVE,
      path: ["src", "config"],
    },
    {
      content: getExampleComponentReact,
      fileName: "Character",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "character"],
    },
  ],
  dependencies: "@apollo/client graphql",
  fileModification: {
    App: {
      importStatement: `import Characters from "src/components/character/Character"`,
      name: "Apollo GraphQL",
      component: "<Characters/>",
    },
    Index: {
      importStatements: `import { ApolloProvider } from "@apollo/client";
import client from "src/config/client";`,
      addAfterMatch: "</ApolloProvider>",
      addBeforeMatch: "<ApolloProvider client={client}>",
    },
  },
  successMessage: "Successfully added apollo client config !",
};

export default GraphQlReactPlugin;
