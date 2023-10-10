import { PluginConfigType } from "@/types";

const getTheme = `import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#013e87",
    },
    secondary: {
      main: "#2e74c9",
    },
  },
  typography: {
    h1: {
      fontSize: "3rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
  },
});

export default theme;`;

const MuiReactPlugin: PluginConfigType = {
  files: [
    {
      path: ["src", "theme"],
      content: getTheme,
      fileName: "theme",
      fileType: "native",
    },
  ],
  dependencies: "@mui/material",
  initializingMessage: "Adding Material UI ! Please Wait !",
  successMessage: "Material UI added successfully !",
  fileModification: {
    Index: {
      importStatements: `import { ThemeProvider } from "@mui/material"; \nimport theme from "./theme/theme"; `,
      addBeforeMatch: "<ThemeProvider theme={theme}>",
      addAfterMatch: "</ThemeProvider>",
    },
    App: {},
  },
};

export default MuiReactPlugin;
