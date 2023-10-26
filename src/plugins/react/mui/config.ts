import { FileType, PluginConfigType } from "@/types";

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

//gives react example components based on project type
const getExampleComponent = (
  isTsProject: boolean,
) => `import { Box, Button, Rating, TextField, Typography } from "@mui/material";
import { useState } from "react";

function MuiExample() {
  const [ratingValue, setRatingValue] = useState${
    isTsProject ? "<number | null>" : ""
  }(null);
  const [comment, setComment] = useState("");
  const isDisabled = ratingValue === null || comment === "";
  return (
      <Box
        sx={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h2" color="primary.main">
          How would you rate this experience ?
        </Typography>
        <Rating
          value={ratingValue}
          onChange={(_, val) => setRatingValue(val)}
          sx={{ m: 2 }}
        />
        <Typography>Tell us how it went</Typography>
        <TextField
          multiline
          maxRows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <Button disabled={isDisabled} sx={{ mt: 1 }} variant="contained">
          Submit
        </Button>
      </Box>
  );
}
export default MuiExample;
`;

const MuiReactPlugin: PluginConfigType = {
  initializingMessage: "Adding Material UI ! Please Wait !",
  files: [
    {
      path: ["src", "theme"],
      content: getTheme,
      fileName: "theme",
      fileType: FileType.NATIVE,
    },
    {
      path: ["src", "components", "muiExample"],
      content: getExampleComponent,
      fileName: "MuiExample",
      fileType: FileType.COMPONENT,
    },
  ],
  dependencies: "@mui/material",
  fileModification: {
    Index: {
      importStatements: `import { ThemeProvider } from "@mui/material"; \nimport theme from "src/theme/theme"; `,
      addBeforeMatch: "<ThemeProvider theme={theme}>",
      addAfterMatch: "</ThemeProvider>",
    },
    App: {
      importStatement: `import MuiExample from "src/components/muiExample/MuiExample"`,
      name: "Material UI",
      component: "<MuiExample/>",
    },
  },
  successMessage: "Successfully added Material UI with theme config !",
};

export default MuiReactPlugin;
