import getCurrentProject from "@/operation/getProjectType";
import { writeFileFromConfig } from "@/utils/file";
import MuiNextPlugin from "@/plugins/nextjs/mui";
import MuiReactPlugin from "@/plugins/react/mui";

export default async function muiAdder() {
  const projectType = getCurrentProject();

  //based on the project type run the configuration to install
  switch (projectType) {
    case "next":
      await addMuiInNext();
      break;
    case "react":
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
