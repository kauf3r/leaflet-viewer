module.exports = {
  // TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
  
  // JSON files
  '*.json': ['prettier --write'],
  
  // Markdown files
  '*.md': ['prettier --write'],
  
  // CSS files
  '*.{css,scss,sass}': ['prettier --write'],
  
  // YAML files
  '*.{yml,yaml}': ['prettier --write'],
  
  // Package.json - run audit after changes
  'package.json': ['npm audit --audit-level moderate'],
  
  // TypeScript config files - check types
  'tsconfig*.json': ['tsc --noEmit'],
};