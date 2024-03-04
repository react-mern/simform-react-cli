import GlobalStateUtility from "@/global";
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

function getStoreConfig(isTsProject: boolean) {
  return `
import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "src/store/features/counterSlice";
import { userApi } from "src/store/api/userApi";
${
  isTsProject
    ? `import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";`
    : ""
}

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(userApi.middleware),
});

${
  isTsProject
    ? `export type RootState = ReturnType<typeof store.getState>;
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
${
  isTsProject
    ? `
export interface CounterState {
  value: number;
  incrementAmount: number;
}`
    : ""
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

function getUserApi(isTsProject: boolean) {
  const projectType =
    GlobalStateUtility.getInstance().getCurrentProjectGenType();
  return `import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLocalStorage } from "src/utils/storage";
 
${
  isTsProject
    ? `type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
};`
    : ""
}

export const USER_API_REDUCER_KEY = "userApi";
${
  projectType === SupportedProjectGenerator.REACT_VITE
    ? "const environment = import.meta.env;"
    : ""
}

const baseQuery = fetchBaseQuery({
  baseUrl: ${
    projectType === SupportedProjectGenerator.REACT_VITE
      ? "environment.VITE_APP_BASE_URL"
      : projectType === SupportedProjectGenerator.REACT_CRA
      ? "process.env.REACT_APP_BASE_URL"
      : ""
  },
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    console.log(getState());
    /**
     * if your backend have refresh and access token both
     * get the access token from the redux store with below code
     * const token = (getState() as RootState).auth.accessToken;
     */
    // const token = (getState() as RootState).auth.accessToken;
    const accessToken = getLocalStorage("accessToken");

    if (accessToken) {
      headers.set("Content-type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("authorization", +=+Bearer \${accessToken}+=+);
    }
    return headers;
  },
});

//if you have access and refresh token both and access token is begin stored in memory(session)
//then add logic to generate the new access token with refresh token

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseQueryWithReAuth = async (args${isTsProject ? ": any" : ""}, api${
    isTsProject ? ": any" : ""
  }, extraOptions${isTsProject ? ": any" : ""}) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    // send refresh token to get new access token
    // const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    // if (refreshResult?.data) {
    /**
     * store the new token and retry the original query with new access token
     */
    //   const { accessToken } = refreshResult.data as LoginResponse;
    //   api.dispatch(setLoggedIn(accessToken));
    //   result = await baseQuery(args, api, extraOptions);
    // } else {
    //   api.dispatch(setLoggedOut());
    // }
  }
  return result;
};

export const userApi = createApi({
  reducerPath: USER_API_REDUCER_KEY,
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["users"],
  keepUnusedDataFor: 60 * 5,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    //on the login you can save the cookie in localstorage
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUsers: builder.query${isTsProject ? "<User[], void>" : ""}({
      query: () => "users",
    }),
  }),
});
`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");
}

const rtkQueryExample = `import React from "react";
import { userApi } from "src/store/api/userApi";

const RtkQueryExample = () => {
  const { data, isLoading } = userApi.useGetUsersQuery();

  if (isLoading) return <div>Loading.....</div>;

  return (
    <div>
      {data?.map(user => {
        return (
          <div key={user.id}>
            <div>User: {user.name} </div>
            <div>Company: {user.company.name} </div>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default RtkQueryExample;
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
  const RtkReduxReactPlugin: PluginConfigType = {
  initializingMessage: "Adding Rtk Query with Redux Store, Please wait !",
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
      content: getUserApi,
      fileName: "userApi",
      fileType: FileType.NATIVE,
      path: ["src", "store", "api"],
    },
    {
      content: rtkQueryExample,
      fileName: "RtkQueryExample",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "rtkQueryExample"],
    },
    {
      content:storageFileContent,
      fileName:"storage",
      fileType:FileType.NATIVE,
      path:["src","utils"]
    }
  ],
  dependencies:`@reduxjs/toolkit react-redux encrypt-storage`,

  fileModification: {
    App: {
      importStatement: `import RtkQueryExample from "src/components/rtkQueryExample/RtkQueryExample"`,
      name: "RTK Query",
      component: "<RtkQueryExample/>",
    },
    Index: {
      importStatements: `import { Provider } from "react-redux";
import { store } from "src/store";`,
      addBeforeMatch: "<Provider store={store}>",
      addAfterMatch: "</Provider>",
    },
  },
  successMessage: "Successfully added rtk-query with redux !",
};
export default RtkReduxReactPlugin;
