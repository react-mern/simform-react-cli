import path from "path";
import getCurrentProject from "@/operation/getProjectType";
import {
  isFileExists,
  moveAllFilesToSubDir,
  writeFileFromConfig,
} from "@/utils/file";
import fs from "fs";
import i18NReactPlugin from "@/plugins/react/i18n";
import i18nNextPlugin from "@/plugins/nextjs/i18n";
import { SupportedProjectType } from "@/types";

export default async function i18nAdder(addI18n: boolean) {
  addI18n && (await addI18nInProject());
}

async function addI18nInProject() {
  const projectType = getCurrentProject();

  //based on the project type run the configuration
  switch (projectType) {
    case SupportedProjectType.NEXT:
      await addI18nInNext();
      break;
    case SupportedProjectType.REACT:
      await addI18nInReact();
      break;
    default:
      break;
  }
}

async function addI18nInNext() {
  await writeFileFromConfig(i18nNextPlugin);

  const isTsProject = isFileExists(process.cwd(), "tsconfig.json");

  const rootLayoutName = `${isTsProject ? "layout.tsx" : "layout.js"}`;

  const file = fs
    .readFileSync(path.join(process.cwd(), "src", "app", rootLayoutName))
    .toString();

  const rootLayoutParams = `RootLayout({
  children,
  params,
}${
    isTsProject
      ? `: {
  children: React.ReactNode;
  params: { lang: Locale };
}`
      : ""
  })`;

  const newFileContent = file.replace(/RootLayout\([^)]*\)/, rootLayoutParams);

  fs.writeFileSync(
    path.join(process.cwd(), "src", "app", rootLayoutName),
    newFileContent,
  );

  moveAllFilesToSubDir(path.join(process.cwd(), "src", "app"), "[lang]");
}

async function addI18nInReact() {
  await writeFileFromConfig(i18NReactPlugin);
}
