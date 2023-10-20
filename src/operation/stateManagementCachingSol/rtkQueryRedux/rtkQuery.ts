import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import RtkQueryNextPlugin from "@/plugins/nextjs/rtkQueryRedux";
import RtkReduxReactPlugin from "@/plugins/react/rtkQueryRedux";
import { SupportedProjectType } from "@/types";

export default async function addRTKQueryWithRedux() {
  const projectType = getCurrentProject();
  //based on the project type run the configuration to install
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addReduxInNext();
      break;
    case SupportedProjectType.REACT:
      await addReduxInReact();
      break;
    default:
      break;
  }
}

async function addReduxInReact() {
  await writeFileFromConfig(RtkReduxReactPlugin);
}

async function addReduxInNext() {
  await writeFileFromConfig(RtkQueryNextPlugin);
}
