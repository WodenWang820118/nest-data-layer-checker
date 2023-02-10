import { readFileSync } from 'fs';

export const HEADLESS = false;
export const rootDir = process.cwd();
export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
export const OPERATIONS = [
  {
    name: 'eeListClick',
    operation: JSON.parse(
      readFileSync(`${rootDir}\\src\\recordings\\eeListClick.json`, 'utf8'),
    ),
  },
];
