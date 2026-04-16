import { RegistrationProvider } from '@providers/RegistrationProvider';

describe('RegistrationProvider', () => {
	let provider: RegistrationProvider;

	beforeEach(() => {
		provider = new RegistrationProvider();
	});

	describe('findRegistration', () => {
		it('should return registration details for a known plate', async () => {
			const result = await provider.findRegistration('AV01XYZ');

			expect(result).not.toBeNull();
			expect(result?.make).toBe('Jaguar');
			expect(result?.model).toBe('I-PACE AV');
			expect(result?.insuranceStatus).toBe('ACTIVE');
		});

		it('should return null for an unknown plate', async () => {
			const result = await provider.findRegistration('XX99ZZZ');

			expect(result).toBeNull();
		});

		it('should return expired MOT data for AV04GHI', async () => {
			const result = await provider.findRegistration('AV04GHI');

			expect(result).not.toBeNull();
			expect(result?.motExpiry).toBe('2025-01-15');
		});

		it('should return pending insurance for AV06MNO', async () => {
			const result = await provider.findRegistration('AV06MNO');

			expect(result).not.toBeNull();
			expect(result?.insuranceStatus).toBe('PENDING');
		});
	});
});
