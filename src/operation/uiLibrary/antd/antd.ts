import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import AntDNextPlugin from "@/plugins/nextjs/antd";
import AntDReactPlugin from "@/plugins/react/antd";

export default async function antDesignAdder(
) {

  const projectType = getCurrentProject();

  //based on the project type run the configuration to install
  switch (projectType) {
    case "next":
      await addAntDInNext();
      break;
    case "react":
      await addAntDInReact();
    default:
      break;
  }
}

async function addAntDInNext() {
  await writeFileFromConfig(AntDNextPlugin);
}

async function addAntDInReact() {
  await writeFileFromConfig(AntDReactPlugin);
}
