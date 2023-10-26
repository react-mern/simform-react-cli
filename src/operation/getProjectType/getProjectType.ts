import fs from "fs";
import path from "path";
import { SupportedProjectType } from "@/types";

export default function getCurrentProject() {
  let projectType: SupportedProjectType = SupportedProjectType.REACT;
  const packageJsonPath = path.join(process.cwd(), "package.json");
  let packageJson;

  //getting package json
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    /** */
  }

  //detecting project type
  if (packageJson?.dependencies) {
    projectType = packageJson?.dependencies?.["react"]
      ? SupportedProjectType.REACT
      : projectType;
    projectType = packageJson?.dependencies?.["next"]
      ? SupportedProjectType.NEXT
      : projectType;
  }
  return projectType;
}
