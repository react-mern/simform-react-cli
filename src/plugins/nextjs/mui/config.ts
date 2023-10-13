import { PluginConfigType } from "@/types";
import { getRegexForRootComponent } from "@/utils/fileManipulation";

const emotionCacheConfig = (isTsProject: boolean) =>
  `"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider as DefaultCacheProvider } from "@emotion/react";
${
  isTsProject
    ? `import type {
  EmotionCache,
  Options as OptionsOfCreateCache,
} from "@emotion/cache";`
    : ""
}${
    isTsProject
      ? `\nexport type NextAppDirEmotionCacheProviderProps = {
  /** This is the options passed to createCache() from 'import createCache from "@emotion/cache"' */
  options: Omit<OptionsOfCreateCache, "insertionPoint">;
  /** By default <CacheProvider /> from 'import { CacheProvider } from "@emotion/react"' */
  CacheProvider?: (props: {
    value: EmotionCache;
    children: React.ReactNode;
  }) => React.JSX.Element | null;
  children: React.ReactNode;
};
`
      : ""
  }
export function NextAppDirEmotionCacheProvider(
  props${isTsProject ? `: NextAppDirEmotionCacheProviderProps` : ""}
) {
  const { options, CacheProvider = DefaultCacheProvider, children } = props;

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted${isTsProject ? `: string[]` : ""} = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    // eslint-disable-next-line no-restricted-syntax
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={+=+\${cache.key}\+\${names.join(" ")}+=+}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
            __html: styles,
        }}
        />
     );
  });

   return <CacheProvider value={cache}>{children}</CacheProvider>;
}
`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");

const ThemeRegistryConfig = (isTsProject: boolean) => `"use client";

import { createTheme,${
  isTsProject ? "ThemeOptions," : ""
} ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import { NextAppDirEmotionCacheProvider } from "./EmotionCache";

const themeOptions${isTsProject ? ": ThemeOptions" : ""} = {
  palette: {
    background: {
      default: "#9dc9fd",
    },
  },
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({
  children,
}${isTsProject ? ": {children: React.ReactNode}" : ""}) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
`;

const MuiNextPlugin: PluginConfigType = {
  initializingMessage: "Adding Material UI ! Please Wait !",
  dependencies:
    "@mui/material @emotion/react @emotion/styled @emotion/cache @mui/icons-material",
  files: [
    {
      content: emotionCacheConfig,
      fileName: "EmotionCache",
      fileType: "component",
      path: ["src", "theme"],
    },
    {
      content: ThemeRegistryConfig,
      fileName: "ThemeRegistry",
      fileType: "component",
      path: ["src", "theme"],
    },
  ],
  fileModification: {
    Layout: {
      importStatements: `import ThemeRegistry from "@/theme/ThemeRegistry";`,
      addAfterMatch: `</ThemeRegistry>`,
      addBeforeMatch: `<ThemeRegistry>`,
      regex: getRegexForRootComponent("body"),
    },
    Page: {},
  },
  successMessage: "Successfully added Material UI with theme config !",
};

export default MuiNextPlugin;
