import { readFileSync } from 'fs';

export const HEADLESS = false;
export const rootDir = process.cwd();
export const OPERATIONS = [
  {
    name: 'eeListClick',
    operation: JSON.parse(
      readFileSync(`${rootDir}\\src\\recordings\\eeListClick.json`, 'utf8'),
    ),
  },
];
