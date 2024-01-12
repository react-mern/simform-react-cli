import { NodePackageManager } from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import logger, { initiatorLog } from "@/utils/logger";

async function addStoryBookInProject(
  currentPackageManager: NodePackageManager,
) {
  try {
    initiatorLog("Adding Storybook, Please wait !");
    await cmdRunner("npx", ["storybook@latest", "init", "-y", "-s"],false);
    logger(
      "yellow",
      `Successfully added storybook ! Run : ${currentPackageManager}${
        currentPackageManager === NodePackageManager.NPM ? " run" : ""
      } storybook after completing setup...`,
    );
  } catch (error) {
    /** */
  }
}

export default addStoryBookInProject;
