import { PluginConfigType } from "@/types";

const antDConfigReact = `const theme = {
  token: {
    // Seed Token
    colorPrimary: "#040b6b",
    borderRadius: 2,

    // Alias Token
    colorBgContainer: "#f6ffed",
  },
};

export default theme;
`;

const getExampleComponent = (
  isTsProject: boolean
) => `import React, { useState } from "react";
import { Button, Radio, Slider, Space } from "antd";
${
  isTsProject
    ? `import type { SizeType } from "antd/es/config-provider/SizeContext";\n`
    : ""
}
const Buttons = () => {
  const [size, setSize] = useState${
    isTsProject
      ? `<
    SizeType | [SizeType, SizeType] | "customize"
  >`
      : ""
  }("small");

  const [customSize, setCustomSize] = useState${
    isTsProject ? "<number>" : ""
  }(0);

  return (
    <>
      <Radio.Group value={size} onChange={e => setSize(e.target.value)}>
        {["small", "middle", "large", "customize"].map(item => (
          <Radio key={item} value={item}>
            {item}
          </Radio>
        ))}
      </Radio.Group>
      <br />
      <br />
      {size === "customize" && (
        <>
          <Slider value={customSize} onChange={setCustomSize} />
          <br />
        </>
      )}
      <Space size={size !== "customize" ? size : customSize}>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="link">Link</Button>
      </Space>
    </>
  );
};

export default Buttons;
`;

const AntDReactPlugin: PluginConfigType = {
  initializingMessage: "Adding AntD, Please wait !",
  dependencies: "antd",
  files: [
    {
      content: antDConfigReact,
      fileName: "themeAntd",
      fileType: "native",
      path: ["src", "theme"],
    },
    {
      content: getExampleComponent,
      fileName: "Buttons",
      fileType: "component",
      path: ["src", "components", "AntdExample"],
    },
  ],
  fileModification: {
    App: {},
    Index: {
      importStatements: `import { ConfigProvider } from "antd";
import theme from "./theme/themeAntd";`,
      addBeforeMatch: `<ConfigProvider theme={theme}>`,
      addAfterMatch: `</ConfigProvider>`,
    },
  },
  successMessage: "Successfully added theme config for ant design !",
};

export default AntDReactPlugin;
