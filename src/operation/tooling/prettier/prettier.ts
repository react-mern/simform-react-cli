import PrettierPlugin from "@/plugins/common/prettier";
import { writeFileFromConfig } from "@/utils/file";

async function addPrettierInProject() {
  await writeFileFromConfig(PrettierPlugin);
}

export default addPrettierInProject;
