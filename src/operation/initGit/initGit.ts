import gitInitPlugin from "@/plugins/common/git";
import cmdRunner from "@/utils/cmdRunner";
import { writeFileFromConfig } from "@/utils/file";

async function initGitRepo() {
  await cmdRunner("git", ["init"]);
  await writeFileFromConfig(gitInitPlugin);
}
export default initGitRepo;
