/**
 * lint-staged configuration keeps pre-commit feedback focused on the files being committed.
 */
export default {
  "src/**/*.{ts,tsx}": ["pnpm exec eslint --max-warnings=0 --fix"],
  "**/*.{ts,tsx,js,jsx,json,css,md}": ["pnpm exec prettier --write"],
};
