import { writeFileFromConfig } from "@/utils/file";
import getCurrentProject from "@/operation/getProjectType";
import AntDNextPlugin from "@/plugins/nextjs/antd";
import AntDReactPlugin from "@/plugins/react/antd";
import { SupportedProjectType } from "@/types";

export default async function antDesignAdder() {
  const projectType = getCurrentProject();

  //based on the project type run the configuration to install
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addAntDInNext();
      break;
    case SupportedProjectType.REACT:
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
