import getCurrentProject from "@/operation/getProjectType";
import { writeFileFromConfig } from "@/utils/file";
import MuiNextPlugin from "@/plugins/nextjs/mui";
import MuiReactPlugin from "@/plugins/react/mui";
import { SupportedProjectType } from "@/types";

export default async function muiAdder() {
  const projectType = getCurrentProject();

  //based on the project type run the configuration to install
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addMuiInNext();
      break;
    case SupportedProjectType.REACT:
      await addMuiInReact();
      break;
    default:
      break;
  }
}

async function addMuiInNext() {
  await writeFileFromConfig(MuiNextPlugin);
}

async function addMuiInReact() {
  await writeFileFromConfig(MuiReactPlugin);
}
