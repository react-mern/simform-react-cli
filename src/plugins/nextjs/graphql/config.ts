import { PluginConfigType } from "@/types";

const envExFileContent = "NEXT_PUBLIC_BASE_URL";

const envFileContent = `${envExFileContent}=https://rickandmortyapi.com/graphql`;

const getApolloWrapperNext = (isTsProject: boolean) => `"use client";

//reference => https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13/
import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";

function makeClient() {
  const httpLink = new HttpLink({
    // you can add link in env
    uri: process.env.NEXT_PUBLIC_BASE_URL,
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}
export function ApolloWrapper({ children }${
  isTsProject ? ": React.PropsWithChildren" : ""
}) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
`;

const getApolloClientNext = `import { HttpLink } from "@apollo/client";
import { NextSSRInMemoryCache, NextSSRApolloClient } from "@apollo/experimental-nextjs-app-support/ssr";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_BASE_URL,
      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with "export const dynamic = "force-static"
      // fetchOptions: { cache: "no-store" },
    }),
  });
});
`;

const getExampleComponentNext = (isTsProject: boolean) =>
  `"use client";

export const dynamic = "force-dynamic";

//reference => https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13/

import { gql } from ${isTsProject ? `"@/__generated__"` : `"@apollo/client"`};
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

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

export default function Character() {
  const { error, data } = useSuspenseQuery(GET_CHARACTERS);

  if (error) return <div>error occurred</div>;

  return (
    <div>
      {data?.characters?.results?.map((character) => {
        return <div key={character?.id}>{character?.name}</div>;
      })}
    </div>
  );
}
`.replaceAll("+=+", "`");

const GraphQlNextPlugin: PluginConfigType = {
  initializingMessage: "Adding GraphQL ! Please wait.. ",
  dependencies: "@apollo/client@rc @apollo/experimental-nextjs-app-support",
  files: [
    {
      content: envFileContent,
      fileName: ".env",
      fileType: "simple",
      path: [],
    },
    {
      content: envExFileContent,
      fileName: ".env.example",
      fileType: "simple",
      path: [],
    },
    {
      content: getApolloWrapperNext,
      fileName: "ApolloWrapper",
      fileType: "component",
      path: ["src", "lib"],
    },
    {
      content: getApolloClientNext,
      fileName: "client",
      fileType: "native",
      path: ["src", "lib"],
    },
    {
      content: getExampleComponentNext,
      fileName: "page",
      fileType: "component",
      path: ["src", "app", "characters"],
    },
  ],
  fileModification: {
    Layout: {
      importStatements: `import { ApolloWrapper } from "@/lib/ApolloWrapper";`,
      addAfterMatch: "</ApolloWrapper>",
      addBeforeMatch: "<ApolloWrapper>",
    },
    Page: {},
  },
};

export default GraphQlNextPlugin;
