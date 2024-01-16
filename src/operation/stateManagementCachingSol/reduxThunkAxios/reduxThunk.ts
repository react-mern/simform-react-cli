import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import { SupportedProjectType } from "@/types";
import ReduxAxiosReactPlugin from "@/plugins/react/reduxThunkAxios/config";

export default async function addReduxThunkWithAxios() {
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
  await writeFileFromConfig(ReduxAxiosReactPlugin);
}

async function addReduxInNext() {
}
