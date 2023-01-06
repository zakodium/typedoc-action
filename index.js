'use strict';

const exists = require('fs').existsSync;
const fs = require('fs').promises;
const path = require('path');

const core = require('@actions/core');
const { exec } = require('@actions/exec');

const entry = core.getInput('entry') || 'src/index.ts';
const name = core.getInput('name');

const defaultTsconfig = `{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
`;

(async () => {
  const packageJson = await getPackageJson();
  const { hasTsConfig, tsConfigPath } = await ensureTsConfig();

  if (!exists('node_modules')) {
    core.warning('node_modules is not present. Running `npm install`...');
    await exec('npm', ['install']);
  }

  await writeTypedocJson(name || packageJson.name, tsConfigPath);

  // Check that the plugin is installed
  console.log(process.cwd());
  const fileExists = await fs.exists(
    path.join(process.cwd(), 'node_modules/typedoc-plugin-katex'),
  );
  console.log('fileExists', fileExists);

  const args = [path.join(__dirname, 'node_modules/typedoc/bin/typedoc')];

  await exec('node', args);
  if (!hasTsConfig) {
    await fs.unlink(tsConfigPath);
  }
})().catch((error) => {
  core.setFailed(error);
});

async function writeTypedocJson(name, tsConfigPath) {
  const options = {
    out: 'docs',
    name,
    excludePrivate: true,
    hideGenerator: true,
    tsconfig: tsConfigPath,
    entryPoints: entry.split(/ +/),
    // typedoc-plugin-katex plugin options
    katex: {
      options: {
        delimiters: [{ left: '$', right: '$', display: true }],
        fleqn: 'true',
        leqno: 'false',
      },
    },
  };
  await fs.writeFile('typedoc.json', JSON.stringify(options, null, 2));
}

async function getPackageJson() {
  return JSON.parse(await fs.readFile('package.json', 'utf-8'));
}

async function ensureTsConfig() {
  let has = true;
  if (!exists('tsconfig.json')) {
    has = false;
    await fs.writeFile('tsconfig.json', defaultTsconfig);
  }
  return { hasTsConfig: has, tsConfigPath: path.resolve('tsconfig.json') };
}
