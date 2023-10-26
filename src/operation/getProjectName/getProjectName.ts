import path from "path";
import { input } from "@inquirer/prompts";
import { isEmptyDir } from "@/utils/file";

//return project name from the user input
async function getProjectName() {
  //getting currentProjectName with validation dir empty or not
  const projectName = await input({
    message: "What is the name of the project ?",
    default: ".",
    validate: (val) => {
      return isEmptyDir(path.join(process.cwd(), val))
        ? true
        : "Current working directory is not empty ! please enter name or remove everything from this directory";
    },
  });

  return projectName.toLowerCase();
}

export default getProjectName;
