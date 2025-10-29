import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bundle with esbuild
await esbuild.build({
  entryPoints: [join(__dirname, 'src/index.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',  // Convert to CommonJS for pkg
  outfile: join(__dirname, 'dist-bundle/index.cjs'),
  external: [
    // Don't bundle these, keep as require()
    '@prisma/client',
    '.prisma/client',
    'prisma'
  ],
  banner: {
    js: `
// Polyfill for __dirname and __filename in CommonJS
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const __filename = fileURLToPath(import.meta.url || 'file://' + __filename);
const __dirname = dirname(__filename);
`
  },
  loader: {
    '.node': 'file'
  },
  logLevel: 'info'
});

console.log('✅ Bundle created successfully!');

