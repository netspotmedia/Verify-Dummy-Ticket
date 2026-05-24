import nextConfig from 'eslint-config-next'

// React Compiler lint rules require opt-in via next.config experimental.reactCompiler.
// This project does not use the React Compiler, so these compiler-only rules are disabled.
const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'public/**',
    ],
  },
  ...nextConfig,
  {
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
]

export default config
