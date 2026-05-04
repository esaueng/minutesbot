import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        console: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        Headers: "readonly",
        ReadableStream: "readonly",
        FormData: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  },
  prettier
];
