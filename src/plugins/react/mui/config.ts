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
  initializingMessage: "Adding Material UI ! Please Wait !",
  files: [
    {
      path: ["src", "theme"],
      content: getTheme,
      fileName: "theme",
      fileType: "native",
    },
  ],
  dependencies: "@mui/material",
  fileModification: {
    Index: {
      importStatements: `import { ThemeProvider } from "@mui/material"; \nimport theme from "src/theme/theme"; `,
      addBeforeMatch: "<ThemeProvider theme={theme}>",
      addAfterMatch: "</ThemeProvider>",
    },
    App: {},
  },
  successMessage: "Successfully added Material UI with theme config !",
};

export default MuiReactPlugin;
