import fs from "fs";
import path from "path";
import { SupportedProjectType } from "@/types";

export default function getCurrentProject() {
  let projectType: SupportedProjectType = "react";
  const packageJsonPath = path.join(process.cwd(), "package.json");
  let packageJson;

  //getting package json
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {}

  //detecting project type
  if (packageJson?.dependencies) {
    projectType = packageJson?.dependencies?.["react"] ? "react" : projectType;
    projectType = packageJson?.dependencies?.["next"] ? "next" : projectType;
  }
  return projectType;
}
