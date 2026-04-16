import { OperatorProvider } from '@providers/OperatorProvider';

describe('OperatorProvider', () => {
	let provider: OperatorProvider;

	beforeEach(() => {
		provider = new OperatorProvider();
	});

	describe('findOperator', () => {
		it('should return operator details for a known plate with operator', async () => {
			const result = await provider.findOperator('AV01XYZ');

			expect(result).not.toBeNull();
			expect(result?.operatorFound).toBe(true);
			expect(result?.operatorName).toBe('Waymo UK Ltd');
		});

		it('should return no-operator details for AV02ABC', async () => {
			const result = await provider.findOperator('AV02ABC');

			expect(result).not.toBeNull();
			expect(result?.operatorFound).toBe(false);
			expect(result?.operatorName).toBeNull();
			expect(result?.licenceNumber).toBeNull();
		});

		it('should return no-operator details for AV03DEF', async () => {
			const result = await provider.findOperator('AV03DEF');

			expect(result).not.toBeNull();
			expect(result?.operatorFound).toBe(false);
		});

		it('should return null for an unknown plate', async () => {
			const result = await provider.findOperator('XX99ZZZ');

			expect(result).toBeNull();
		});
	});
});
