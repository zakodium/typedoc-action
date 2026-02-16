import * as core from '@actions/core';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const defaultTsconfig = `{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
`;

const actionDir = path.join(import.meta.dirname, '..');

export async function executeAction({
  entry,
  name,
  treatWarningsAsErrors,
  onWarn,
  exec,
}) {
  const packageJson = getPackageJson();
  const { hasTsConfig } = ensureTsConfig();

  if (!existsSync('node_modules')) {
    onWarn('node_modules is not present. Running `npm install`...');
    await exec('npm', ['install']);
  }

  writeTypedocJson(entry, name || packageJson.name, treatWarningsAsErrors);

  const args = [path.join(actionDir, 'node_modules/typedoc/bin/typedoc')];

  await exec('node', args);
  if (!hasTsConfig) {
    unlinkSync(tsConfigPath);
  }
}

function writeTypedocJson(entry, name, treatWarningsAsErrors) {
  let customTypedoc = '{}';
  if (existsSync('typedoc.json')) {
    customTypedoc = readFileSync('typedoc.json', 'utf-8');
    core.info('Custom typedoc.json loaded');
  } else {
    core.info('No custom typedoc.json found');
  }
  /**
   * @type {import('typedoc').TypeDocOptions}
   */
  const options = {
    out: 'docs',
    name,
    excludePrivate: true,
    hideGenerator: true,
    entryPoints: entry.split(/ +/),
    treatWarningsAsErrors,
    ...JSON.parse(customTypedoc),
  };
  writeFileSync('typedoc.json', JSON.stringify(options, null, 2));
}

function getPackageJson() {
  return JSON.parse(readFileSync('package.json', 'utf-8'));
}

function ensureTsConfig() {
  let has = true;
  if (!existsSync('tsconfig.json')) {
    has = false;
    writeFileSync('tsconfig.json', defaultTsconfig);
  }
  return { hasTsConfig: has };
}
