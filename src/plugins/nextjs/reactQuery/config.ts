import { FileType, PluginConfigType } from "@/types";
import { getRegexForRootComponent } from "@/utils/fileManipulation";

const envExFileContent = "NEXT_PUBLIC_BASE_URL";

const envFileContent = `${envExFileContent}=https://jsonplaceholder.typicode.com/`;

const axiosApiReact = (isTsProject: boolean) =>
  `import axios from "axios";
  import { getLocalStorage,setLocalStorage } from "@/utils/storage";

/*

Here I've created request interceptors to intercept
request and add token into request header from localstorage.
You can update this logic as well create response interceptors based on project requirements.

I've added custom config called withoutAuth in axios instance
withoutAuth config value will decide whether send a token in request or not.
if API need token in header in that case yu don't have to pass withoutAuth config
and it will work as expected.
EX: 
API.get('/users')
API.post('/posts', { title: 'foo', body: 'bar', userId: 1 })

When you don't need token in header at that time you've to pass withoutAuth true.
EX: 
API.get('/users', { withoutAuth: true})
API.post('/posts', { title: 'foo', body: 'bar', userId: 1 }, { withoutAuth: true })
*/

${
  isTsProject
    ? `
declare module "axios" {
  export interface AxiosRequestConfig {
    withoutAuth?: boolean;
  }
}`
    : ""
}

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withoutAuth: false,
  headers: {
    "Content-Type": "application/json",
  },
  /*
  you can pass common config here.
  */
});

/**
 * If your backend has refresh and access token then to refresh the access token you can add logic to the below function
 * can save access token in memory and refresh token in cookie
 */
// Define a function to refresh the token
const refreshToken = async () => {
  //   try {
  //     const response = await axios.post("YOUR_REFRESH_TOKEN_ENDPOINT", {
  //       refreshToken: getLocalStorage("refreshToken"), // Load the refreshToken from localstorage or if https cookie then just make get request to your endpoint
  //     });
  //     const newAccessToken = response.data.accessToken;
  //     setLocalStorage("accessToken", newAccessToken);
  //     return newAccessToken;
  //   } catch (error) {
  //     throw error;
  //   }
};

// A request interceptor to inject the access token into requests
API.interceptors.request.use(
  config => {
    const accessToken = getLocalStorage("accessToken"); // Load the access token from  local storage

    if (!config.withoutAuth && accessToken) {
      config.headers["Authorization"] = +=+Bearer \${accessToken}+=+;
    }

    return config;
  },
  error => {
    // Handle request errors here

    return Promise.reject(error);
  }
);

// A response interceptor to handle token expiration and auto-refresh
API.interceptors.response.use(
  response => {
    // Modify the response data here
    return response;
  },
  async error => {
    if (error.response && error.response.status === 401) {
      // Token expired, try to refresh the token
      const newAccessToken = await refreshToken();

      // Update the original request with the new access token
      const originalRequest = error.config;
      originalRequest.headers["Authorization"] = +=+Bearer \${newAccessToken}+=+;

      // Retry the original request
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);

${
  isTsProject
    ? `//post type
type PostType = {
  userId: number;
  id: number;
  title: string;
  body: string;
};`
    : ""
}

//get posts
export const getPosts = async () =>
  API.get${
    isTsProject ? "<PostType[]>" : ""
  }("/posts", { withoutAuth: true }).then(res => res.data);

//create post
export const createPost = (body${
    isTsProject ? ": { heading: string; content: string }" : ""
  }) =>
  API.post("/item/create", body);
`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");

const queryClientOptions = `export const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
};
`;

const getQueryClient = `
import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { queryClientOptions } from "./queryClientOptions";

const getQueryClient = cache(() => new QueryClient(queryClientOptions));
export default getQueryClient;

`;

const postClient = (isTsProject: boolean) => `"use client";

import React from "react";
${
  isTsProject
    ? `interface Props {
  post: {
    userId: number;
    id: number;
    title: string;
    body: string;
  };
}`
    : ""
}

export const Post = ({ post }${isTsProject ? `: Props` : ""}) => {
  return (
    <div className="py-4">
      <p className="text-2xl font-semibold">{post.title}</p>
      <p className="mt-2 text-gray-200">{post.body}</p>
    </div>
  );
};
`;

const postsClient = (isTsProject: boolean) => `
"use client";

import { getPosts } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Post } from "./Post.client";

${
  isTsProject
    ? `
type PostType = {
  userId: number;
  id: number;
  title: string;
  body: string;
};`
    : ""
}
export const Posts = () => {
  const { data, isLoading } = useQuery${isTsProject ? "<PostType[]>" : ""}({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) return <div>Loading....</div>;
  if (!data) return <div>Not found</div>;

  return (
    <section>
    <div className="divide-y">
      {data.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </div>
    </section>
  );
};
`;

const postPage = `import { ReactQueryHydrate } from "@/components/ReactQueryHydrate/ReactQueryHydrate";
import { Posts } from "@/components/posts/Posts.client";
import getQueryClient from "@/lib/getQueryClient";
import { getPosts } from "@/utils/api";
import { dehydrate } from "@tanstack/react-query";

export default async function PostsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <ReactQueryHydrate state={dehydratedState}>
      <Posts />
    </ReactQueryHydrate>
  );
}
`;

const providers = (isTsProject: boolean) => `"use client";

import { queryClientOptions } from "@/lib/queryClientOptions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";
${
  isTsProject
    ? `interface Props {
  children: ReactNode;
}`
    : ""
}

export const Providers = ({ children }${isTsProject ? ": Props" : ""}) => {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
`;

const ReactQueryHydrate = (isTsProject: boolean) => `"use client";

import { HydrationBoundary as RQHydrate, HydrationBoundaryProps } from "@tanstack/react-query";

export const ReactQueryHydrate = (props: ${isTsProject?"HydrationBoundaryProps":""}) => {
  return <RQHydrate {...props} />;
};
`;
function storageFileContent(isTsProject:boolean){
  return `
  import { EncryptStorage } from "encrypt-storage";
  
  export const encryptStorage = new EncryptStorage("secret-key-value", {
    prefix: "authService",
  });
  
  export const getLocalStorage = ${
    isTsProject
      ? ` (key: string): string | null`
      : "(key)"}
   => {
    try {
      const encryptValue = encryptStorage.getItem(key);
      const value = encryptStorage.decryptValue(encryptValue);
      return value;
    } catch (error) {
      console.error(\`Error retrieving local storage item: \${key}\`, error);
      return null;
    }
  };
  
  export const setLocalStorage = ${
    isTsProject
      ? ` (key: string,value:string): void`
      : "(key,value)"} => {
    try {
      const encryptedValue = encryptStorage.encryptValue(value);
      encryptStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(\`Error setting local storage item: \${key}\`, error);
    }
  };
  `;
}
const postLocation = ["src", "components", "posts"];

const ReactQueryNextPlugin: PluginConfigType = {
  initializingMessage: "Adding React Query, Please wait !",
  dependencies:  `@tanstack/react-query @tanstack/react-query-devtools axios encrypt-storage`,
  files: [
    {
      content: envFileContent,
      fileName: ".env",
      fileType: FileType.SIMPLE,
      path: [],
    },
    {
      content: envExFileContent,
      fileName: ".env.example",
      fileType: FileType.SIMPLE,
      path: [],
    },
    {
      content: axiosApiReact,
      fileName: "api",
      fileType: FileType.NATIVE,
      path: ["src", "utils"],
    },
    {
      content: queryClientOptions,
      fileName: "queryClientOptions",
      fileType: FileType.NATIVE,
      path: ["src", "lib"],
    },
    {
      content: getQueryClient,
      fileName: "getQueryClient",
      fileType: FileType.NATIVE,
      path: ["src", "lib"],
    },
    {
      content: postClient,
      fileName: "Post.client",
      fileType: FileType.COMPONENT,
      path: postLocation,
    },
    {
      content: postsClient,
      fileName: "Posts.client",
      fileType: FileType.COMPONENT,
      path: postLocation,
    },
    {
      content: providers,
      fileName: "Providers.client",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "Providers"],
    },
    {
      content: ReactQueryHydrate,
      fileName: "ReactQueryHydrate",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "ReactQueryHydrate"],
    },
    {
      content: postPage,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "posts"],
    },
    {
      content:storageFileContent,
      fileName:"storage",
      fileType:FileType.NATIVE,
      path:["src","utils"]
    }
  ],
  fileModification: {
    Layout: {
      importStatements: `import { Providers } from "@/components/Providers/Providers.client";`,
      addAfterMatch: "</Providers>",
      addBeforeMatch: "<Providers>",
      regex: getRegexForRootComponent("body"),
      examplePath:"/posts",
      exampleName:"ReactQuery Example"
    },
    Page: {},
  },
  successMessage: "Successfully added React Query with Provider config !",
};

export default ReactQueryNextPlugin;
