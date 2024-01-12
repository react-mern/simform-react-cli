import { PluginConfigType, FileType } from "@/types";
import { getRegexForRootComponent } from "@/utils/fileManipulation";

const envExFileContent = "NEXT_PUBLIC_BASE_URL";

const envFileContent = `NEXT_PUBLIC_BASE_URL=https://jsonplaceholder.typicode.com`;

function getStoreConfig(isTsProject: boolean) {
  return `
import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./features/counterSlice";
import { userApi } from "./api/userApi";
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

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
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

export const StoreProviderConfig = (isTsProject: boolean) => `"use client";
import React from "react";
import { store } from "./index${""}";
import { Provider } from "react-redux";

export default function StoreProvider({
  children,
}${
  isTsProject
    ? `: {
  children: React.ReactNode;
}`
    : ""
}) {
  return <Provider store={store}>{children}</Provider>;
}
`;

export const rtkQueryExampleNext = `"use client";
import React from "react";
import { userApi } from "@/store/api/userApi";

const RtkQueryExample = () => {
  const { data, isLoading } = userApi.useGetUsersQuery();

  if (isLoading) return <div>Loading.....</div>;

  return (
    <section>
      {data?.map(user => {
        return (
          <div key={user.id}>
            <div>User: {user.name} </div>
            <div>Company: {user.company.name} </div>
            <hr />
          </div>
        );
      })}
    </section>
  );
};

export default RtkQueryExample;
`;

const RtkQueryNextPlugin: PluginConfigType = {
  initializingMessage: "Adding Rtk Query with Redux Store, Please wait !",
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
      content: getUserApi,
      fileName: "userApi",
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
  ],
  dependencies: function (isTsProject: boolean) {
    return `@reduxjs/toolkit react-redux js-cookie ${
      isTsProject ? "@types/js-cookie" : ""
    }`;
  },
  fileModification: {
    Page: {},
    Layout: {
      importStatements: `import StoreProvider from "@/store/StoreProvider";`,
      addBeforeMatch: "<StoreProvider>",
      addAfterMatch: "</StoreProvider>",
      regex: getRegexForRootComponent("html"),
      examplePath:"/users",
      exampleName:"RTK Query Example"
    },
  },
  successMessage: "Successfully added rtk-query with redux !",
};
export default RtkQueryNextPlugin;
