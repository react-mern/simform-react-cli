import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import ReactQueryReactPlugin from "@/plugins/react/reactQuery";
import ReactQueryNextPlugin from "@/plugins/nextjs/reactQuery";
import { SupportedProjectType } from "@/types";

export default async function addReactQuery() {
  const projectType = getCurrentProject();

  //based on the project type run the configuration to install
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addReactQueryInNext();
      break;
    case SupportedProjectType.REACT:
      await addReactQueryInReact();
      break;
    default:
      break;
  }
}

async function addReactQueryInNext() {
  await writeFileFromConfig(ReactQueryNextPlugin);
}

async function addReactQueryInReact() {
  await writeFileFromConfig(ReactQueryReactPlugin);
}
