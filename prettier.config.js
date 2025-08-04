/** @type {import('prettier').Config} */
const config = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  
  // Line formatting
  printWidth: 80,
  endOfLine: 'lf',
  
  // JSX specific
  jsxSingleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Plugin configurations
  plugins: [],
  
  // File type overrides
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 120,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.css',
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
  ],
};

module.exports = config;