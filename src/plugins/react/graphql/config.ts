import { PluginConfigType } from "@/types";

const reactGraphqlClientConfig = `import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://rickandmortyapi.com/graphql",
  cache: new InMemoryCache(),
});

export default client;
`;

export const getExampleComponentReact = (isTsProject: boolean) =>
  `import React from "react";
import { useQuery${isTsProject ? "" : ", gql"} } from "@apollo/client";
${isTsProject ? `import { gql } from "../../__generated__";` : ""}

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
    App: {},
    Index: {
      importStatements: `import { ApolloProvider } from "@apollo/client";
import client from "./config/client";`,
      addAfterMatch: "</ApolloProvider>",
      addBeforeMatch: "<ApolloProvider client={client}>",
    },
  },
  successMessage: "Successfully added apollo client config !",
};

export default GraphQlReactPlugin;
