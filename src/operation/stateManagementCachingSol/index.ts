import { SupportedStateManagementAndCachingSol } from "@/types";
import addGraphQL from "./graphql";
import addRTKQueryWithRedux from "./rtkQueryRedux";
import addReactQuery from "./reactQuery";

export default async function stateManagementCachingSolAdder(
  cachingOption: SupportedStateManagementAndCachingSol
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
    default:
      break;
  }
}
