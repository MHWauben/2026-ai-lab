import { VersionService } from '@services/VersionService';
import { displayName, version } from '@/package.json';

describe('VersionService', () => {
	let mockService: VersionService;

	beforeEach(() => {
		mockService = new VersionService();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getVersion', () => {
		it('should construct a version object', async () => {
			// ACT
			const data = mockService.getVersion();

			// ASSERT
			expect(data).toEqual({
				buildDateTime: expect.any(String),
				name: displayName,
				version,
			});
		});
	});
});
