import { SupportedStateManagementAndCachingSol } from "@/types";
import addGraphQL from "./graphql";
import addRTKQueryWithRedux from "./rtkQueryRedux";
import addReactQuery from "./reactQuery";
import addReduxThunkWithAxios from "./reduxThunkAxios";

export default async function stateManagementCachingSolAdder(
  cachingOption: SupportedStateManagementAndCachingSol,
) {
  switch (cachingOption) {
    case SupportedStateManagementAndCachingSol.RTK_QUERY_REDUX:
      await addRTKQueryWithRedux();
      break;
    case SupportedStateManagementAndCachingSol.GRAPHQL:
      await addGraphQL();
      break;
    case SupportedStateManagementAndCachingSol.REACT_QUERY:
      await addReactQuery();
      break;
    case SupportedStateManagementAndCachingSol.REDUX_THUNK_AXIOS:
        await addReduxThunkWithAxios();
        break;
    default:
      break;
  }
}
