import { copyFileSync, readFileSync } from 'node:fs';
import { ServicePackager } from '@dvsa/service-bundler';
import { name, version } from './package.json';

(async () => {
	const [majorNodeVersion] = readFileSync('.nvmrc', 'utf-8').trim().split('.');

	await new ServicePackager({
		nodeMajorVersion: majorNodeVersion,
		proxy: { name, version },
		handlerFileName: 'index.ts',
	}).build({
		zip: process.argv.includes('--package'),
	});

	// Copy .mjs to .js so serverless-offline can resolve the handler
	copyFileSync('dist/src/proxy/index.mjs', 'dist/src/proxy/index.js');
})();
