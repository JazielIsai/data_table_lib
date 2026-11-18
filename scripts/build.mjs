import { build } from 'vite';
import { copyFile } from 'node:fs/promises';

await build();
await copyFile('src/index.d.ts', 'dist/index.d.ts');
