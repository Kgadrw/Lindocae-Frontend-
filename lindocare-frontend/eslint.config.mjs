import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable React Hook exhaustive-deps warning
      "react-hooks/exhaustive-deps": "off",
      // Disable unused variables warning
      "@typescript-eslint/no-unused-vars": "off",
      // Disable unescaped entities warning
      "react/no-unescaped-entities": "off",
      // Disable explicit any warning
      "@typescript-eslint/no-explicit-any": "off",
      // Disable prefer-const warning
      "prefer-const": "off",
      // Disable img element warning
      "@next/next/no-img-element": "off",
      // Disable custom font warning
      "@next/next/no-page-custom-font": "off",
      // Disable TypeScript strict mode for build
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
