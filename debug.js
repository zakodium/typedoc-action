import { execFileSync } from 'node:child_process';

import { executeAction } from './src/index.js';

function exec(command, args, options) {
  return execFileSync(command, args, { stdio: 'inherit', ...options });
}

function onWarn(message) {
  core.warning(message);
}

await executeAction({
  entry: 'src/index.ts',
  name: 'test',
  treatWarningsAsErrors: false,
  onWarn,
  exec,
});
