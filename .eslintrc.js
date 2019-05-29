module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "globals": {
    optionsType: true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],

    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "lines-between-class-members": ["error", "always"],
    "no-undef": 1,
    "no-var": "error",
    "camelcase": [2, { "properties": "always" }],
    "brace-style": "error",
    "comma-spacing": ["error", { "before": false, "after": true }]
  }
};