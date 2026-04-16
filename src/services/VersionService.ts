import type { VersionModel } from '@domain/models/VersionModel';
import { Service } from 'typedi';
import { displayName, version } from '@/package.json';

@Service()
export class VersionService {
	getVersion(): VersionModel {
		return {
			name: displayName,
			buildDateTime: process.env.BUILD_DATETIME ?? new Date().toString(),
			version: version,
		};
	}
}
