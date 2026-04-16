import { readFileSync } from 'node:fs';
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

// not importing file directly as `ts-jest` does not support `preserve` module, which TS now recommends in v6
const { compilerOptions } = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));

const config: Config = {
	testEnvironment: 'node',
	setupFiles: ['./jest-setup-file.ts'],
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	reporters: ['default', 'github-actions'],
	coveragePathIgnorePatterns: ['docs', 'src/domain/models', 'tests', 'website', 'dist', '/node_modules/'],
	coverageThreshold: {
		global: { branches: 95, functions: 95, lines: 95, statements: 95 },
	},
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths ?? {}, { prefix: '<rootDir>/' }),
	},
	transform: {
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					parser: { syntax: 'typescript', tsx: true, decorators: true },
					transform: { legacyDecorator: true, decoratorMetadata: true },
					target: 'es2022',
					keepClassNames: true,
					externalHelpers: false,
				},
				module: { type: 'es6' },
				sourceMaps: false,
			},
		],
	},
	transformIgnorePatterns: ['/node_modules/'],
	testPathIgnorePatterns: ['/dist/', '/build/'],
	modulePathIgnorePatterns: ['/dist/', '/build/'],
	maxWorkers: '50%',
	watchPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/coverage'],
};

export default config;
