import { FileType, PluginConfigType } from "@/types";

const themeConfigNext = (isTsProject: boolean) => `${
  isTsProject ? `import type { ThemeConfig } from "antd";` : ""
}
const theme${isTsProject ? ": ThemeConfig" : ""} = {
  token: {
    fontSize: 16,
    colorPrimary: "#52c41a",
  },
};

export default theme;
`;

const antdRegistryNext = (isTsProject: boolean) => `"use client";

import React from "react";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";
${
  isTsProject ? `import type Entity from "@ant-design/cssinjs/es/Cache";\n` : ""
}
const StyledComponentsRegistry = ({ children }${
  isTsProject ? ": React.PropsWithChildren" : ""
}) => {
  const cache = React.useMemo${
    isTsProject ? "<Entity>" : ""
  }(() => createCache(), []);
  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

export default StyledComponentsRegistry;
`;

const antdExampleNext = `import React from "react";
import { Button, ConfigProvider } from "antd";
import theme from "@/theme/themeConfig";
import Title from "antd/es/typography/Title";

const HomePage = () => (
  <ConfigProvider theme={theme}>
  <section>
    <div className="App">
    <Title level={1}>AntD Example</Title>

      <Button type="primary">Button</Button>
    </div>
    </section>
  </ConfigProvider>
);

export default HomePage;
`;

const AntDNextPlugin: PluginConfigType = {
  initializingMessage: "Adding AntD, Please wait !",
  dependencies: "@ant-design/cssinjs antd",
  files: [
    {
      content: themeConfigNext,
      fileName: "themeConfig",
      fileType: FileType.NATIVE,
      path: ["src", "theme"],
    },
    {
      content: antdRegistryNext,
      fileName: "AntdRegistry",
      fileType: FileType.COMPONENT,
      path: ["src", "lib"],
    },
    {
      content: antdExampleNext,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "antd"],
    },
  ],
  fileModification: {
    Layout: {
      importStatements: `import StyledComponentsRegistry from "@/lib/AntdRegistry";`,
      addAfterMatch: `</StyledComponentsRegistry>`,
      addBeforeMatch: `<StyledComponentsRegistry>`,
      regex: /{children}/,
      examplePath:"/antd",
      exampleName:"AntD Example"
    },
    Page: {},
  },
  successMessage: "Successfully added AntD with theme config !",
};

export default AntDNextPlugin;
