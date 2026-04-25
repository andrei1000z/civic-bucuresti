import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Legacy rule — React 19 handles these fine
      "react/no-unescaped-entities": "off",
      // Next-themes requires setMounted pattern; strict rule too aggressive
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      // Args/vars cu underscore prefix sunt convențional „intentionally
      // unused" (Sentry callbacks, signature-only params, etc.). ESLint
      // default warneste pe ele — dezactivăm warning-ul ca să fie clean.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
