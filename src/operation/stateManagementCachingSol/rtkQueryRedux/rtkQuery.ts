import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import RtkQueryNextPlugin from "@/plugins/nextjs/rtkQueryRedux";
import RtkReduxReactPlugin from "@/plugins/react/rtkQueryRedux";

export default async function addRTKQueryWithRedux() {
  const projectType = getCurrentProject();
  //based on the project type run the configuration to install
  switch (projectType) {
    case "next":
      await addReduxInNext();
      break;
    case "react":
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
