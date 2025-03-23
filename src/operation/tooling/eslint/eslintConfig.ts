export function eslintNextConfig(
  hasTypescript: boolean,
  hasPrettier: boolean,
  hasStorybook: boolean,
) {
  //base config for nextJs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseConfig: Record<string, any> = {
    extends: ["next/core-web-vitals"],
  };

  const initialDependencies = "eslint eslint-config-next";

  const [config, dependencies] = eslintConfigModifier(
    baseConfig,
    initialDependencies,
    hasTypescript,
    hasPrettier,
    hasStorybook,
  );
  return [JSON.stringify(config, null, 2), dependencies] as const;
}

function eslintConfigModifier(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseConfig: Record<string, any>,
  dependencies: string,
  hasTypescript: boolean,
  hasPrettier: boolean,
  hasStorybook: boolean,
  hasJavascript?: boolean,
) {
  if (hasTypescript) {
    baseConfig.plugins = ["@typescript-eslint"];
    baseConfig.parser = "@typescript-eslint/parser";
    baseConfig.extends.push("plugin:@typescript-eslint/eslint-recommended");
    baseConfig.extends.push("plugin:@typescript-eslint/recommended");
    dependencies +=
      " @typescript-eslint/parser @typescript-eslint/eslint-plugin";
  }

  if (hasJavascript) {
    baseConfig.parserOptions = {
      ecmaVersion: "latest",
      sourceType: "module",
    };
  }

  if (hasPrettier) {
    baseConfig.extends.push("prettier");
    baseConfig.extends.push("plugin:prettier/recommended");
    dependencies += " eslint-config-prettier eslint-plugin-prettier";
  }

  if (hasStorybook) {
    dependencies += " eslint-plugin-storybook";
    baseConfig.extends.push("plugin:storybook/recommended");
  }

  return [baseConfig, dependencies] as const;
}
