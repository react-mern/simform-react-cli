import {
  NodePackageManager,
  SupportedLanguage,
  SupportedProjectGenerator,
  SupportedStateManagementAndCachingSol,
  SupportedUILibrary,
} from "@/types";
import { writeFile } from "@/utils/file";

type ReadmeGen = {
  prettier?: boolean;
  husky?: boolean;
  eslint?: boolean;
  storybook?: boolean;
  language?: SupportedLanguage;
  currentPackageManager?: NodePackageManager;
  cachingOption?: SupportedStateManagementAndCachingSol;
  selectedLibrary?: SupportedUILibrary;
  i18n?: boolean;
  currentProjectType: SupportedProjectGenerator;
};

export default async function readmeGenerator({
  currentProjectType,
  cachingOption,
  currentPackageManager,
  eslint,
  husky,
  i18n,
  language,
  prettier,
  selectedLibrary,
  storybook,
}: ReadmeGen) {
  // ======== Logo ========== //
  const readme = [
    `![Logo](https://www.simform.com/wp-content/uploads/2022/12/logo.svg)`,
  ];

  //=========== Heading ==========//
  readme.push(
    `# ${currentProjectType === "next" ? "Next Js" : "React Js"} Boilerplate`
  );

  readme.push(
    `This boilerplate is starting point of any project with all batteries included. you can directly start development without spending time on project setup.`
  );

  //======== TECH STACK ===========//
  readme.push("## Tech Stack");

  readme.push(`**Client:** [React](react.dev), ${
    language === "ts" ? "[Typescript](https://www.typescriptlang.org)," : ""
  } ${
    currentProjectType === "next"
      ? "[Next Js](https://nextjs.org/),"
      : currentProjectType === "react-cra"
      ? "[Create-React-App](https://create-react-app.dev/),"
      : "[Vite](https://vitejs.dev/),"
  } ${
    cachingOption === "graphql"
      ? "[Apollo Client](https://www.apollographql.com/docs/react/),"
      : cachingOption === "react-query"
      ? "[React-Query](https://tanstack.com/query/latest),"
      : cachingOption === "rtk-query-redux"
      ? "[Redux (RTK-Query)](https://redux.js.org/),"
      : ""
  } ${
    currentProjectType !== "next"
      ? "[React Router](https://reactrouter.com/en/main),"
      : ""
  } \n 
`);

  (selectedLibrary || storybook) &&
    readme.push(
      `**Styling:** ${
        selectedLibrary === "antd"
          ? "[Antd](https://ant.design/),"
          : selectedLibrary === "mui"
          ? "[Material UI](https://mui.com/material-ui/),"
          : ""
      } ${storybook ? "[Storybook](https://storybook.js.org/)," : ""} \n`
    );

  cachingOption === "react-query" &&
    readme.push(`**HTTP Client:** [axios](https://axios-http.com/) \n`);

  i18n &&
    readme.push(
      `**Internationalization:** [i18next](https://react.i18next.com/) \n`
    );

  readme.push(
    `**Code Formatter:** ${
      prettier ? "[Prettier](https://prettier.io/)," : ""
    }  ${
      husky ? "[Husky](https://typicode.github.io/husky)," : ""
    } [Eslint](https://eslint.org/) \n`
  );

  //========= Developer Guide =========//
  readme.push(`
### Developer Guide

1. To begin, set your Git username and email using the following commands:
   - \`git config user.name "{username}"\`
   - \`git config user.email "{email}"\`

2. Avoid pushing or committing directly to the \`main\` branch.

3. When creating a new branch, use one of the following naming conventions:
   - \`feature/feature-name\`
   - \`bug/bug-details\`
   - \`design/design-details\`

4. Format your commit messages as \`Ticket number : Title\` only. For example: \`T-101 : Deploy site on production environment.\`

5. Prior to committing, ensure you verify and resolve linting issues by running the following commands:
   - \`npm run lint\`
   - \`npm run lint:fix\`

6. Each Pull Request (PR) should contain only a single commit. If you've made multiple commits, rebase them into a single commit before submitting the PR.

7. Add comments when necessary for better understanding, and make further improvements as needed.

8. Customize the ESLint rules in the .eslintrc.cjs file to meet your project's specific requirements.
`);

  // ======= Useful scripts ==========//
  const prefix =
    currentPackageManager === "npm"
      ? "npm run"
      : currentPackageManager === "pnpm"
      ? "pnpm"
      : "yarn";

  readme.push(`### Other useful scripts`);

  readme.push(`- \`${prefix} build\` to build a project`);

  readme.push(
    `- \`${prefix} ${
      currentProjectType === "next"
        ? "dev"
        : currentProjectType === "react-cra"
        ? "start"
        : "dev"
    }\` to run (dev) a project`
  );

  readme.push(`- \`${prefix} build\` to build a project`);

  readme.push(`- \`${prefix} preview\` to run preview a project`);

  readme.push(
    `- \`${prefix} lint\` to lint a project \n - \`${prefix} lint:fix\` to lint:fix a project`
  );

  prettier && readme.push(`- \`${prefix} format\` to format a project`);

  storybook &&
    readme.push(
      `- \`${prefix} storybook\` to start storybook dev server \n - \`${prefix} build-storybook\` to build storybook`
    );

  const readmeContent = readme.join("\n");

  //writing readme file with the dynamically generated readme content
  writeFile("README.md", readmeContent);
}
