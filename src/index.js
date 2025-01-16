import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const defaultTsconfig = `{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
`;

const actionDir = path.join(import.meta.dirname, '..');

export async function executeAction({entry, name, treatWarningsAsErrors, onWarn, exec}) {
  const packageJson = getPackageJson();
  const tsVersion = getTsVersion(packageJson);
  const { hasTsConfig, tsConfigPath } = ensureTsConfig();

  if (!existsSync('node_modules')) {
    onWarn('node_modules is not present. Running `npm install`...');
    await exec('npm', ['install']);
  }

  writeTypedocJson(entry, name || packageJson.name, tsConfigPath, treatWarningsAsErrors);

  if (tsVersion) {
    // Install the same version of TypeScript as the project.
    await exec('npm', ['install', `typescript@${tsVersion}`], {
      cwd: actionDir,
    });
  }

  const args = [
    path.join(actionDir, 'node_modules/typedoc/bin/typedoc'),
  ];

  await exec('node', args, {
    cwd: actionDir,
  });
  if (!hasTsConfig) {
    unlinkSync(tsConfigPath);
  }
}

function writeTypedocJson(entry, name, tsConfigPath, treatWarningsAsErrors) {
  /**
   * @type {import('typedoc').TypeDocOptions}
   */
  const options = {
    out: path.resolve('docs'),
    name,
    excludePrivate: true,
    hideGenerator: true,
    tsconfig: path.resolve(tsConfigPath),
    entryPoints: entry.split(/ +/).map((entry) => path.resolve(entry)),
    treatWarningsAsErrors,
  };
  writeFileSync(
    path.join(actionDir, 'typedoc.json'),
    JSON.stringify(options, null, 2),
  );
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
  return { hasTsConfig: has, tsConfigPath: path.resolve('tsconfig.json') };
}

function getTsVersion(packageJson) {
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  const tsVersion = deps.typescript || devDeps.typescript;
  return tsVersion || null;
}
