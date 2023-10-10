import { SupportedStateManagementAndCachingSol } from "@/types";
import addGraphQL from "./graphql";
import addRTKQueryWithRedux from "./rtkQueryRedux";
import addReactQuery from "./reactQuery";

export default async function stateManagementCachingSolAdder(
  cachingOption: SupportedStateManagementAndCachingSol
) {
  switch (cachingOption) {
    case "rtk-query-redux":
      await addRTKQueryWithRedux();
      break;
    case "graphql":
      await addGraphQL();
      break;
    case "react-query":
      await addReactQuery();
      break;
    default:
      break;
  }
}
