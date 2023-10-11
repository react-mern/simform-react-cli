import { PluginConfigType } from "@/types";

const gitIgnore = `
# compiled output
dist
build
.next
storybook-static
tmp
dist-ssr
/out-tsc
.env
.env.local

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln

# testing
/coverage

# misc
.DS_Store
*.pem

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`;

const gitInitPlugin: PluginConfigType = {
  files: [
    {
      content: gitIgnore,
      fileName: ".gitignore",
      fileType: "simple",
      path: [],
    },
  ],
};

export default gitInitPlugin;
