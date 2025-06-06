import {defineConfig} from 'eslint/config'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import {fixupPluginRules} from '@eslint/compat'

export default defineConfig([{
  plugins: {
    react,
    'react-hooks': fixupPluginRules(reactHooks)
  },

  languageOptions: {
    globals: {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    globalThis: 'readonly'
    },

    ecmaVersion: 2022,
    sourceType: 'module',

    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  },

  settings: {
    react: {
      version: 'detect'
    }
  },

  env: {
    browser: true,
    es2020: true
  },

  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'comma-dangle': 2,
    'no-cond-assign': 2,
    'no-console': 0,
    'no-constant-condition': 2,
    'no-control-regex': 2,
    'no-debugger': 2,
    'no-dupe-args': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty': 2,
    'no-empty-character-class': 2,
    'no-ex-assign': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': 0,
    'no-extra-semi': 2,
    'no-func-assign': 2,
    'no-inner-declarations': 2,
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-negated-in-lhs': 2,
    'no-obj-calls': 2,
    'no-regex-spaces': 2,
    'no-sparse-arrays': 2,
    'no-unexpected-multiline': 2,
    'no-unreachable': 2,
    'use-isnan': 2,
    // "valid-jsdoc": 2,
    'valid-typeof': 2,
    'no-unused-private-class-members': 2,
    'accessor-pairs': 2,
    'array-callback-return': 2,
    'block-scoped-var': 2,
    complexity: 0,
    'consistent-return': 2,
    curly: 2,
    'default-case': 2,
    'dot-location': [2, 'property'],
    'dot-notation': 2,
    eqeqeq: 2,
    'guard-for-in': 2,
    'no-alert': 2,
    'no-caller': 2,
    'no-case-declarations': 2,
    'no-constant-binary-expression': 2,
    'no-div-regex': 2,
    'no-else-return': 2,
    'no-empty-function': 0,
    'no-empty-pattern': 2,
    'no-eq-null': 2,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-label': 2,
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-implicit-coercion': 2,
    'no-implicit-globals': 2,
    'no-implied-eval': 2,
    'no-iterator': 2,
    'no-invalid-this': 2,
    'no-labels': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-magic-numbers': 0,
    'no-multi-spaces': 2,
    'no-multi-str': 2,
    'no-native-reassign': 2,
    'no-new': 2,
    'no-new-func': 2,
    'no-new-wrappers': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-param-reassign': 2,
    'no-process-env': 0,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-return-assign': 2,
    'no-script-url': 2,
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-throw-literal': 2,
    'no-unmodified-loop-condition': 2,
    'no-unused-expressions': 2,
    'no-unused-labels': 2,
    'no-useless-call': 2,
    'no-useless-concat': 2,
    'no-void': 2,
    'no-warning-comments': 0,
    'no-with': 2,
    radix: 0,
    'require-await': 2,
    'vars-on-top': 2,
    'wrap-iife': 2,
    yoda: 2,
    strict: 0,
    'init-declarations': 0,
    'no-catch-shadow': 2,
    'no-delete-var': 2,
    'no-label-var': 2,
    'no-restricted-globals': 0,
    'no-shadow': 2,
    'no-shadow-restricted-names': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-undefined': 0,

    'no-unused-vars': [2, {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    'no-use-before-define': [2, 'nofunc'],
    'callback-return': 2,
    'global-require': 0,
    'handle-callback-err': 2,
    'no-buffer-constructor': 2,
    'no-mixed-requires': 2,
    'no-new-require': 2,
    'no-path-concat': 2,
    'no-process-exit': 0,
    'no-restricted-imports': 0,
    'no-restricted-modules': 0,
    'no-sync': 1,
    'array-bracket-spacing': [2, 'never'],
    'block-spacing': [2, 'always'],
    'brace-style': 2,
    camelcase: 0,

    'comma-spacing': [2, {
      before: false,
      after: true
    }],

    'comma-style': [2, 'last'],
    'computed-property-spacing': [2, 'never'],
    'consistent-this': [2, 'me'],
    'eol-last': 2,
    'func-names': 0,
    'func-style': 0,
    'id-blacklist': 0,
    'id-length': 0,
    'id-match': 0,

    indent: [2, 2, {
      SwitchCase: 1
    }],

    'jsx-quotes': [2, 'prefer-double'],

    'key-spacing': [2, {
      beforeColon: false,
      afterColon: true
    }],

    'keyword-spacing': [2, {
      before: true,
      after: true
    }],

    'linebreak-style': [2, 'unix'],

    'lines-around-comment': [2, {
      beforeBlockComment: true,
      afterBlockComment: false,
      afterLineComment: false
    }],

    'max-depth': [2, 3],

    'max-len': [2, {
      code: 1000,
      tabWidth: 2,
      ignoreTemplateLiterals: true
    }],

    'max-nested-callbacks': [2, 3],
    'max-params': [2, 5],
    'max-statements': 0,

    'new-cap': [2, {
      newIsCap: true,
      capIsNew: false
    }],

    'new-parens': 2,
    'newline-after-var': [2, 'always'],
    'newline-per-chained-call': 0,
    'no-array-constructor': 2,
    'no-bitwise': 2,
    'no-continue': 2,
    'no-inline-comments': 0,
    'no-lonely-if': 2,
    'no-mixed-spaces-and-tabs': 2,

    'no-multiple-empty-lines': [2, {
      max: 2
    }],

    'no-negated-condition': 2,
    'no-nested-ternary': 2,
    'no-new-object': 2,
    'no-plusplus': 0,
    'no-restricted-syntax': [2, 'WithStatement'],
    'no-spaced-func': 2,
    'no-ternary': 0,
    'no-trailing-spaces': 1,
    'no-underscore-dangle': 2,
    'no-unneeded-ternary': 2,
    'no-whitespace-before-property': 2,
    'object-curly-spacing': [2, 'never'],
    'one-var': [2, 'never'],
    'one-var-declaration-per-line': 2,
    'operator-assignment': [2, 'never'],
    'operator-linebreak': [2, 'after'],
    'padded-blocks': [2, 'never'],
    'quote-props': [2, 'as-needed'],
    quotes: [2, 'single'],
    'require-jsdoc': 0,
    semi: [2, 'never'],

    'semi-spacing': [2, {
      before: false,
      after: true
    }],

    'sort-imports': 0,
    'sort-vars': 0,
    'space-before-blocks': [2, 'always'],

    'space-before-function-paren': [2, {
      anonymous: 'always',
      named: 'never'
    }],

    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,

    'space-unary-ops': [2, {
      words: true,
      nonwords: false
    }],

    'spaced-comment': [2, 'always'],
    'wrap-regex': 0,
    'arrow-body-style': [2, 'as-needed'],
    'arrow-parens': [2, 'as-needed'],
    'arrow-spacing': 2,
    'constructor-super': 2,
    'generator-star-spacing': [2, 'before'],
    'no-class-assign': 2,
    'no-confusing-arrow': 0,
    'no-const-assign': 2,
    'no-dupe-class-members': 2,
    'no-new-symbol': 2,
    'no-this-before-super': 2,
    'no-useless-constructor': 2,
    'no-var': 2,
    'object-shorthand': 2,
    'prefer-arrow-callback': 2,
    'prefer-const': 2,
    'prefer-reflect': 0,
    'prefer-rest-params': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'require-yield': 2,
    'template-curly-spacing': 2,
    'yield-star-spacing': 2,
    'react/display-name': 0,

    'react/forbid-prop-types': [2, {
      forbid: ['any', 'array']
    }],

    'react/no-danger': 2,
    'react/no-deprecated': 2,
    'react/no-did-mount-set-state': 2,
    'react/no-did-update-set-state': 2,
    'react/no-direct-mutation-state': 2,
    'react/no-is-mounted': 2,
    'react/no-multi-comp': 0,
    'react/no-set-state': 0,
    'react/no-string-refs': 2,
    'react/no-unknown-property': 2,
    'react/prefer-es6-class': 0,
    'react/prefer-stateless-function': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 2,
    'react/self-closing-comp': 2,
    'react/sort-comp': 2,
    'react/jsx-boolean-value': [2, 'always'],

    'react/jsx-closing-bracket-location': [2, {
      selfClosing: 'after-props',
      nonEmpty: 'after-props'
    }],

    'react/jsx-curly-spacing': [2, 'never'],
    'react/jsx-equals-spacing': 2,

    'react/jsx-handler-names': [2, {
      eventHandlerPrefix: 'on',
      eventHandlerPropPrefix: 'on'
    }],

    'react/jsx-indent-props': [2, 2],
    'react/jsx-indent': [2, 2],
    'react/jsx-key': 2,

    'react/jsx-max-props-per-line': [2, {
      maximum: 4
    }],

    'react/jsx-no-bind': [2, {
      allowArrowFunctions: true
    }],

    'react/jsx-no-duplicate-props': [2, {
      ignoreCase: true
    }],

    'react/jsx-no-literals': 0,
    'react/jsx-no-undef': 2,
    'react/jsx-pascal-case': 2,
    'react/jsx-sort-prop-types': 0,
    'react/jsx-sort-props': 0,

    'react/jsx-tag-spacing': [2, {
      beforeSelfClosing: 'always'
    }],

    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/jsx-wrap-multilines': 2
  }
}])
