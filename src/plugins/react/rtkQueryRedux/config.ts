import GlobalStateUtility from "@/global";
import { PluginConfigType, SupportedProjectGenerator } from "@/types";
import { isFileExists } from "@/utils/file";

const envExFile = (isTsProject: boolean) => {
  const isViteProject = isFileExists(process.cwd(), "vite.config");
  return `${isViteProject ? "VITE_APP" : "REACT_APP"}_BASE_URL`;
};

const getEnvConfig = (isTsProject: boolean) => {
  const prefix = envExFile(isTsProject);
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
import cookies from "js-cookie";

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
    const accessToken = cookies.get("accessToken");
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
    //on the login you can save the cookie with js-cookie
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

const RtkReduxReactPlugin: PluginConfigType = {
  initializingMessage: "Adding Rtk Query with Redux Store, Please wait !",
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
      content: getStoreConfig,
      fileName: "index",
      fileType: "native",
      path: ["src", "store"],
    },
    {
      content: getCounterSliceConfig,
      fileName: "counterSlice",
      fileType: "native",
      path: ["src", "store", "features"],
    },
    {
      content: getUserApi,
      fileName: "userApi",
      fileType: "native",
      path: ["src", "store", "api"],
    },
    {
      content: rtkQueryExample,
      fileName: "RtkQueryExample",
      fileType: "component",
      path: ["src", "components", "rtkQueryExample"],
    },
  ],
  dependencies: function (isTsProject: boolean) {
    return `@reduxjs/toolkit react-redux js-cookie ${
      isTsProject ? "@types/js-cookie" : ""
    }`;
  },
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
