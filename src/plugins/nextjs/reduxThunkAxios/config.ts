import GlobalStateUtility from "@/global";
import { PluginConfigType, FileType } from "@/types";
import { getRegexForRootComponent } from "@/utils/fileManipulation";

const envExFileContent = "NEXT_PUBLIC_BASE_URL";

const envFileContent = `NEXT_PUBLIC_BASE_URL=https://jsonplaceholder.typicode.com`;

function getStoreConfig(isTsProject: boolean) {
  return `
import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./features/counterSlice";
import postSlice from "./features/postSlice";
${isTsProject? `import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";`: ""}

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    post:postSlice
  },
});
${isTsProject? `export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain "useDispatch" and "useSelector"
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;`
    : ""
}
`;
}

function getCounterSliceConfig(isTsProject: boolean) {
  return `import { createSlice${
    isTsProject ? ", PayloadAction " : ""
  }} from "@reduxjs/toolkit";
${isTsProject? `export interface CounterState {
  value: number;
  incrementAmount: number;
}`: ""
}

const initialState${isTsProject ? ": CounterState " : ""}= {
  value: 0,
  incrementAmount: 1,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: state => {
      state.value += state.incrementAmount;
    },
    decrement: state => {
      state.value -= state.incrementAmount;
    },
    changeIncrementAmount: (state, action${
      isTsProject ? ": PayloadAction<number>" : ""
    }) => {
      state.incrementAmount = action.payload;
    },
  },
});

export const { increment, decrement, changeIncrementAmount } =
  counterSlice.actions;

export default counterSlice.reducer;
`;
}

function getPostSlice(isTsProject: boolean) {
    const projectType =
      GlobalStateUtility.getInstance().getCurrentProjectGenType();
    return `import { createAsyncThunk, createSlice ${
      isTsProject ? ", PayloadAction " : ""
    } } from "@reduxjs/toolkit";
    import { getPosts ${isTsProject?",PostType":""} } from "@/store/api/api";
    export const getPostApi = createAsyncThunk("posts", async () => {
      try {
        const response = await getPosts();
        return response;
      } catch (error) {
        // you can create util functon to handle errors.
        return Promise.reject(error);
      }
    });
  
  ${isTsProject? `type PostState = {
          loading: boolean;
          error: string | undefined;
          posts: PostType[];
        };`: ""
  }
  const initialState${isTsProject?`: PostState`:""} = { posts: [], loading: false, error: "" };
  export const postSlice = createSlice({
      name: "posts",
      initialState,
      reducers: {},
      extraReducers(builder) {
        builder.addCase(getPostApi.pending, (state) => {
          state.loading = true;
        });
        builder.addCase(getPostApi.fulfilled, (state, action${isTsProject?`:PayloadAction<PostType[]>`:""}) => {
          state.loading = false;
          state.posts = action.payload;
          state.error = "";
        });
        builder.addCase(getPostApi.rejected, (state, action) => {
          state.loading = false;
          state.posts = [];
          state.error = action.error.message;
        });
      },
    });
    export default postSlice.reducer;
  `
      .replaceAll(/\\/g, "")
      .replaceAll("+=+", "`");
  }

function getApi(isTsProject: boolean) {
  return `import axios from "axios";
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
  ${isTsProject?`declare module "axios" {
    export interface AxiosRequestConfig {
      withoutAuth?: boolean;
    }
  }`:``
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
    //       refreshToken: getLocalStorage("refreshToken"), // Load the refreshToken from cookies or if https cookie then just make get request to your endpoint
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
    (config) => {
      const accessToken = getLocalStorage("accessToken"); // Load the access token from local storage
  
      if (!config.withoutAuth && accessToken) {
        config.headers["Authorization"] = +=+Bearer \${accessToken}+=+;
      }
  
      return config;
    },
    (error) => {
      // Handle request errors here
  
      return Promise.reject(error);
    },
  );
  
  // A response interceptor to handle token expiration and auto-refresh
  API.interceptors.response.use(
    (response) => {
      // Modify the response data here
      return response;
    },
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired, try to refresh the token
        const newAccessToken = await refreshToken();
  
        // Update the original request with the new access token
        const originalRequest = error.config;
        originalRequest.headers["Authorization"] =+=+Bearer \${newAccessToken}+=+;
  
        // Retry the original request
        return axios(originalRequest);
      }
  
      return Promise.reject(error);
    },
  );
  
  //post type
  ${isTsProject?` export type PostType = {
    userId: number;
    id: number;
    title: string;
    body: string;
  };`:""}

  
  //get posts
  export const getPosts = async () => API.get ${ isTsProject? "<PostType[]>":""}("/posts", { withoutAuth: true }).then((res) => res.data);
  
  //create post
  export const createPost = (body ${isTsProject?":{ heading: string; content: string }":""}) => API.post("/item/create", body);
  
`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");
}

export const StoreProviderConfig = (isTsProject: boolean) => `"use client";
import React from "react";
import { store } from "./index${""}";
import { Provider } from "react-redux";

export default function StoreProvider({
  children,
}${isTsProject? `: {
  children: React.ReactNode;
}`
    : ""
}) {
  return <Provider store={store}>{children}</Provider>;
}
`;

export const rtkQueryExampleNext =(isTsProject:boolean)=> `"use client";
import React, { useEffect } from "react";
${isTsProject? 
    `import { useAppDispatch, useAppSelector } from "@/store/index";`:`import { useDispatch, useSelector } from "react-redux";`
}
import { getPostApi } from "@/store/features/postSlice";

const QueryExample = () => {
   
  const dispatch = ${isTsProject?"useAppDispatch();":"useDispatch();"}

  const { posts, loading } =  ${isTsProject?"useAppSelector":"useSelector"}((state) => state.post);

  useEffect(() => {
    dispatch(getPostApi());
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {posts &&
        posts?.map((post) => {
          return <div key={post.id}>{post.title}</div>;
        })}
    </div>
  );
};

export default QueryExample;

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
const ReduxThunkNextPlugin: PluginConfigType = {
  initializingMessage: "Adding RTk axios with Redux Store, Please wait !",
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
      content: getStoreConfig,
      fileName: "index",
      fileType: FileType.NATIVE,
      path: ["src", "store"],
    },
    {
      content: getCounterSliceConfig,
      fileName: "counterSlice",
      fileType: FileType.NATIVE,
      path: ["src", "store", "features"],
    },
    {
        content: getPostSlice,
        fileName: "postSlice",
        fileType: FileType.NATIVE,
        path: ["src", "store", "features"],
      },
    {
      content: getApi,
      fileName: "api",
      fileType: FileType.NATIVE,
      path: ["src", "store", "api"],
    },
    {
      content: StoreProviderConfig,
      fileName: "StoreProvider",
      fileType: FileType.COMPONENT,
      path: ["src", "store"],
    },
    {
      content: rtkQueryExampleNext,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "users"],
    },
    {
      content:storageFileContent,
      fileName:"storage",
      fileType:FileType.NATIVE,
      path:["src","utils"]
    }
  ],
  dependencies:`@reduxjs/toolkit react-redux encrypt-storage axios`,
  
  fileModification: {
    Page: {},
    Layout: {
      importStatements: `import StoreProvider from "@/store/StoreProvider";`,
      addBeforeMatch: "<StoreProvider>",
      addAfterMatch: "</StoreProvider>",
      regex: getRegexForRootComponent("html"),
      examplePath:"/users",
      exampleName:"RTK Axios Example"
    },
  },
  successMessage: "Successfully added rtk-query with redux !",
};
export default ReduxThunkNextPlugin;
