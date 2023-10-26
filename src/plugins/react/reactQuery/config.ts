import { FileType, PluginConfigType, SupportedProjectGenerator } from "@/types";
import { isFileExists } from "@/utils/file";

const envExFile = () => {
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  return `${isViteProject ? "VITE_APP" : "REACT_APP"}_BASE_URL`;
};

const getEnvConfig = () => {
  const prefix = envExFile();
  return prefix + "=https://jsonplaceholder.typicode.com/";
};

const reactQueryConfig = `import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      staleTime: 3 * 1000 * 1000,
    },
  },
});

export default queryClient;`;

const axiosApiReact = (
  isTsProject: boolean,
  projectType?: SupportedProjectGenerator,
) =>
  `import axios from "axios";
import Cookies from "js-cookie";


/*
Best practice to store access-token and refresh-token is
cookie not a local storage. 

Here I've created request interceptors to intercept
request and add token into request header from cookie.
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

${
  projectType === SupportedProjectGenerator.REACT_VITE
    ? "const environment = import.meta.env;"
    : ""
}
export const API = axios.create({
  baseURL: ${
    projectType === SupportedProjectGenerator.REACT_VITE
      ? "environment.VITE_APP_BASE_URL"
      : projectType === SupportedProjectGenerator.REACT_CRA
      ? "process.env.REACT_APP_BASE_URL"
      : ""
  },
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
  //       refreshToken: Cookies.get("refreshToken"), // Load the refreshToken from cookies or if https cookie then just make get request to your endpoint
  //     });
  //     const newAccessToken = response.data.accessToken;
  //     Cookies.set("accessToken", newAccessToken, { path: "/" });
  //     return newAccessToken;
  //   } catch (error) {
  //     throw error;
  //   }
};

// A request interceptor to inject the access token into requests
API.interceptors.request.use(
  config => {
    const accessToken = Cookies.get("accessToken"); // Load the access token from cookies or local storage

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
  API.post("/item/create", body);`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");

const reactQueryExample = `import { useQuery } from "@tanstack/react-query";
import { getPosts } from "src/utils/api";

const ReactQueryExample = () => {
  const { data, error, isLoading } = useQuery({ queryKey: ["posts"], queryFn: getPosts });

  if (error) return <div>An error occurred</div>;

  if (isLoading) return <div>Loading.......</div>;

  return (
    <div>
      {data?.map(post => {
        return <div key={post.id}>{post.title}</div>;
      })}
    </div>
  );
};

export default ReactQueryExample;
`;

const ReactQueryReactPlugin: PluginConfigType = {
  initializingMessage: "Adding React Query, Please wait !",
  dependencies: function (isTsProject: boolean) {
    return `@tanstack/react-query @tanstack/react-query-devtools axios js-cookie ${
      isTsProject ? "@types/js-cookie" : ""
    }`;
  },
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
      content: reactQueryConfig,
      fileName: "queryClient",
      fileType: FileType.NATIVE,
      path: ["src", "client"],
    },
    {
      content: axiosApiReact,
      fileName: "api",
      fileType: FileType.NATIVE,
      path: ["src", "utils"],
    },
    {
      content: reactQueryExample,
      fileName: "ReactQueryExample",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "reactQueryExample"],
    },
  ],
  fileModification: {
    App: {
      importStatement: `import ReactQueryExample from "src/components/reactQueryExample/ReactQueryExample"`,
      name: "React Query",
      component: "<ReactQueryExample />",
    },
    Index: {
      importStatements: `import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "src/client/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";`,
      addAfterMatch: `<ReactQueryDevtools />
    </QueryClientProvider>`,
      addBeforeMatch: `<QueryClientProvider client={queryClient}>`,
    },
  },
  successMessage: "Successfully added React Query with query client config !",
};

export default ReactQueryReactPlugin;
