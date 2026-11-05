import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Generated output is not application source. ESLint 9 flat config needs
// an explicit global ignore (Git's .gitignore does not apply here).
const eslintConfig = [
  {
    ignores: ["**/.next/**", "**/out/**", "**/build/**", "**/coverage/**"],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
