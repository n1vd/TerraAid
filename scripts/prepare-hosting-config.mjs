import { copyFile, mkdir } from 'node:fs/promises';

const source = new URL('../localhost/hosting.json', import.meta.url);
const targetDirectory = new URL('../.openai/', import.meta.url);
const target = new URL('../.openai/hosting.json', import.meta.url);

await mkdir(targetDirectory, { recursive: true });
await copyFile(source, target);
