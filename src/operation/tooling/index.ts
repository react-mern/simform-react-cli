import addPrettierInProject from "./prettier";
import addEslintInProject from "./eslint";
import addStoryBookInProject from "./storybook";
import addHuskyInProject from "./husky";
import GlobalStateUtility from "@/global";

export async function addTooling(
  addPrettier: boolean,
  addStoryBook: boolean,
  addHusky: boolean
) {
  const currentPackageManager =
    GlobalStateUtility.getInstance().getCurrentPackageManager();

  if (addPrettier) await addPrettierInProject();

  if (addStoryBook) await addStoryBookInProject(currentPackageManager);

  if (addHusky) await addHuskyInProject(currentPackageManager);

  await addEslintInProject(currentPackageManager);
}
