import { NodePackageManager } from "@/types";
import cmdRunner from "@/utils/cmdRunner";
import logger, { initiatorLog } from "@/utils/logger";

async function addStoryBookInProject(
  currentPackageManager: NodePackageManager
) {
  try {
    initiatorLog("Adding Storybook, Please wait !");
    await cmdRunner("npx", ["sb", "init", "-y", "-s"]);
    logger(
      "yellow",
      `Successfully added storybook ! Run : ${currentPackageManager}${
        currentPackageManager === "npm" ? " run" : ""
      } storybook after completing setup...`
    );
  } catch (error) {}
}

export default addStoryBookInProject;
