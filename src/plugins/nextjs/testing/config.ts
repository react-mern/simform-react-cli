import { FileType, PluginConfigType } from "@/types";

const vitestConfig = (
  isTsProject: boolean,
) => `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.${isTsProject ? "ts" : "js"}",
  },
});
`;

const setupTestContent = (
  isTsProject: boolean,
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

const buttonTestComponent = `import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./page";

describe("Button component", () => {
  it("Button should render correctly", () => {
    render(<Button />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
`;

const buttonComponent = `import React from "react";

const page = () => {
  return <button>page</button>;
};

export default page;
`;

const VitestNextPlugin: PluginConfigType = {
  initializingMessage: "Adding Testing Configuration, Please wait !",
  devDependencies:
    "vitest @testing-library/react jsdom @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react @vitest/ui",
  files: [
    {
      content: vitestConfig,
      fileName: "vitest.config",
      fileType: FileType.NATIVE,
      path: [],
    },
    {
      content: setupTestContent,
      fileName: "setupTests",
      fileType: FileType.NATIVE,
      path: [],
    },
    {
      content: buttonTestComponent,
      fileName: "button.test",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "testing"],
    },
    {
      content: buttonComponent,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "testing"],
    },
  ],
  scripts: {
    test: "vitest run",
    "test-watch": "vitest",
    "test:ui": "vitest --ui",
  },
  successMessage: "Successfully added Vitest in Next Project !",
};

export default VitestNextPlugin;
