import { FileType, PluginConfigType } from "@/types";

const buttonComponent = `import React from "react";

const Button = () => {
  return <button>Button</button>;
};

export default Button;
`;

const buttonTestComponent = `//Button/__test__/Button.test.tsx
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button component", () => {
  it("Button should render correctly", () => {
    render(<Button />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
`;

const setupTestContent = (
  isTsProject: boolean
) => `import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
${
  isTsProject
    ? `declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}`
    : ""
}
expect.extend(matchers);
`;

export const VitestReactVitePlugin: PluginConfigType = {
  initializingMessage: "Adding Testing Configuration, Please wait !",
  devDependencies:
    "vitest @testing-library/react jsdom @testing-library/jest-dom @testing-library/user-event @vitest/ui",
  files: [
    {
      content: buttonComponent,
      fileName: "Button",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "button"],
    },
    {
      content: buttonTestComponent,
      fileName: "Button.test",
      fileType: FileType.COMPONENT,
      path: ["src", "components", "button", "__test__"],
    },
    {
      content: setupTestContent,
      fileName: "setupTests",
      fileType: FileType.NATIVE,
      path: [],
    },
  ],
  scripts: {
    test: "vitest run",
    "test-watch": "vitest",
    "test:ui": "vitest --ui",
  },
  successMessage: "Successfully added Vitest in React !",
};
