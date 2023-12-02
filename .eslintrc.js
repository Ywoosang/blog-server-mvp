module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js", "dist/", "node_modules/"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleQuote: true,
        semi: true,
        useTabs: false,
        tabWidth: 4,
        trailingComma: "none",
        printWidth: 120,
        bracketSpacing: true,
        arrowParens: "avoid",
      },
    ],
    'padding-line-between-statements': [
      "error",
      { blankLine: "always", prev: "*", next: "return" }
    ]
  },
};
