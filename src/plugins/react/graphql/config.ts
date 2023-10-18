import { PluginConfigType, SupportedProjectGenerator } from "@/types";
import { isFileExists } from "@/utils/file";

const envExFile = (isTsProject: boolean) => {
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  return `${isViteProject ? "VITE_APP" : "REACT_APP"}_BASE_URL`;
};

const getEnvConfig = (isTsProject: boolean) => {
  const prefix = envExFile(isTsProject);
  return prefix + "=https://rickandmortyapi.com/graphql";
};

const reactGraphqlClientConfig = (
  isTsProject: boolean,
  projectType?: SupportedProjectGenerator
) => `import { ApolloClient, InMemoryCache } from "@apollo/client";

${projectType === "react-vite" ? "const environment = import.meta.env;" : ""}

const client = new ApolloClient({
  uri: ${
    projectType === "react-vite"
      ? "environment.VITE_APP_BASE_URL"
      : projectType === "react-cra"
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
      fileType: "simple",
      path: [],
    },
    {
      content: envExFile,
      fileName: ".env.example",
      fileType: "simple",
      path: [],
    },
    {
      content: reactGraphqlClientConfig,
      fileName: "client",
      fileType: "native",
      path: ["src", "config"],
    },
    {
      content: getExampleComponentReact,
      fileName: "Character",
      fileType: "component",
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
