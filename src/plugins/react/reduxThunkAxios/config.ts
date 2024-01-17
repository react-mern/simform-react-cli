import GlobalStateUtility from "@/global";
import { FileType, PluginConfigType } from "@/types";
import { isFileExists } from "@/utils/file";

const envExFile = () => {
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  return `${isViteProject ? "VITE_APP" : "REACT_APP"}_BASE_URL`;
};

const getEnvConfig = () => {
  const prefix = envExFile();
  return prefix + "=https://jsonplaceholder.typicode.com/";
};

function getStoreConfig(isTsProject: boolean) {
  return `
  import { configureStore } from "@reduxjs/toolkit";
  import counterSlice from "src/store/features/counterSlice";
  import postSlice from "./features/postSlice";

${isTsProject? `import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";`: ""
}
export const store = configureStore({
    reducer: {
      counter: counterSlice,
      post: postSlice,
    },
  });
${isTsProject? `export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain "useDispatch" and "useSelector"
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;`: ""
}
`;
}

function getCounterSliceConfig(isTsProject: boolean) {
  return `import { createSlice${
    isTsProject ? ", PayloadAction " : ""
  }} from "@reduxjs/toolkit";
${isTsProject? `
export interface CounterState {
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
  import { getPosts ${isTsProject?",PostType":""} } from "src/utils/api";
  export const getPostApi = createAsyncThunk("posts", async () => {
    try {
      const response = await getPosts();
      return response;
    } catch (error) {
      // you can create util functon to handle errors.
      return Promise.reject(error);
    }
  });

${
  isTsProject
    ? `type PostState = {
        loading: boolean;
        error: string | undefined;
        posts: PostType[];
      };`
    : ""
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

const reduxThunkExample =(isTsProject:boolean)=>{

    return `import React, { useEffect } from "react";
    ${isTsProject ? 
        `import { useAppDispatch, useAppSelector } from "src/store";`
        : 
        `import { useDispatch, useSelector } from "react-redux";`
    
    }
    import { getPostApi } from "src/store/features/postSlice";
    
    const QueryExample = () => {
        const dispatch = ${isTsProject?" useAppDispatch();":" useDispatch();"}
        
        const { posts, loading } =  ${isTsProject?" useAppSelector((state)=>state.post);":" useSelector((state)=>state.post);"}
        
        useEffect(() => {
            dispatch(getPostApi());
        },[]);
        
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
    `
}
const getApiContent = (isTsProject:boolean)=>{
    return `import axios from "axios";
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
    
    ${ isTsProject? `declare module "axios" {
      export interface AxiosRequestConfig {
        withoutAuth?: boolean;
      }
    }`:""}
    
    const environment = import.meta.env;
    export const API = axios.create({
      baseURL: environment.VITE_APP_BASE_URL,
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
      (config) => {
        const accessToken = Cookies.get("accessToken"); // Load the access token from cookies or local storage
    
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
   ${ isTsProject?`export type PostType = {
      userId: number;
      id: number;
      title: string;
      body: string;
    };`:""}
    
    //get posts
    export const getPosts = async () => API.get ${ isTsProject?`<PostType[]>`:""}("/posts", { withoutAuth: true }).then((res) => res.data);
    
    //create post
    export const createPost = (body${ isTsProject?`: { heading: string; content: string }`:""}) => API.post("/item/create", body);
    `.replaceAll("+=+", "`");
}
const ReduxAxiosReactPlugin: PluginConfigType = {
  initializingMessage: "Adding Redux Axios with Redux Store, Please wait !",
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
      content: reduxThunkExample,
      fileName: "ReduxThunkExample",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "reduxThunkExample"],
    },
    {
        content: getApiContent,
        fileName: "api",
        fileType: FileType.NATIVE,
        path: ["src", "utils"],
    },
  ],
  dependencies: function (isTsProject: boolean) {
    return `@reduxjs/toolkit react-redux js-cookie axios ${
      isTsProject ? "@types/js-cookie" : ""
    }`;
  },
  fileModification: {
    App: {
      importStatement: `import ReduxThunkExample from "src/components/reduxThunkExample/ReduxThunkExample"`,
      name: "Redux Thunk Example",
      component: "<ReduxThunkExample/>",
    },
    Index: {
      importStatements: `import { Provider } from "react-redux";
import { store } from "src/store";`,
      addBeforeMatch: "<Provider store={store}>",
      addAfterMatch: "</Provider>",
    },
  },
  successMessage: "Successfully added Thunk with redux !",
};
export default ReduxAxiosReactPlugin;
