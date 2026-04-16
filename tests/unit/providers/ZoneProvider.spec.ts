import { ZoneProvider } from '@providers/ZoneProvider';

describe('ZoneProvider', () => {
	let provider: ZoneProvider;

	beforeEach(() => {
		provider = new ZoneProvider();
	});

	describe('checkZone', () => {
		it('should return active zone for a vehicle in a designated zone', async () => {
			const result = await provider.checkZone('AV01XYZ');

			expect(result).not.toBeNull();
			expect(result?.zoneName).toBe('Canary Wharf AV Zone');
			expect(result?.zoneActive).toBe(true);
		});

		it('should return no zone for a vehicle outside designated zones', async () => {
			const result = await provider.checkZone('AV03DEF');

			expect(result).not.toBeNull();
			expect(result?.zoneName).toBeNull();
			expect(result?.zoneActive).toBe(false);
		});

		it('should return null for an unknown plate', async () => {
			const result = await provider.checkZone('XX99ZZZ');

			expect(result).toBeNull();
		});
	});
});
