import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { OperatorProvider } from '@providers/OperatorProvider';
import { OperatorService } from '@services/OperatorService';
import { Container } from 'typedi';
import { OperatorProviderMock } from '@/tests/mocks/providers/OperatorProvider.mock';

jest.mock('@providers/OperatorProvider');

describe('OperatorService', () => {
	let service: OperatorService;
	let mockProvider: jest.Mocked<OperatorProvider>;

	beforeEach(() => {
		Container.set(OperatorProvider, new OperatorProviderMock());
		mockProvider = Container.get(OperatorProvider) as jest.Mocked<OperatorProvider>;
		service = new OperatorService(mockProvider);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return UNKNOWN when vehicle not found', async () => {
		mockProvider.findOperator.mockResolvedValue(null);

		const result = await service.checkOperator('XX99ZZZ');

		expect(result.status).toBe(CheckStatus.UNKNOWN);
		expect(result.details.operatorFound).toBe(false);
	});

	it('should return FAIL when no operator is linked', async () => {
		mockProvider.findOperator.mockResolvedValue({
			operatorFound: false,
			operatorName: null,
			licenceNumber: null,
			licenceExpiry: null,
			avAuthorised: false,
		});

		const result = await service.checkOperator('AV02ABC');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('No private hire operator');
	});

	it('should return FAIL when operator is not AV authorised', async () => {
		mockProvider.findOperator.mockResolvedValue({
			operatorFound: true,
			operatorName: 'Some Operator',
			licenceNumber: 'PHV-001',
			licenceExpiry: '2028-01-01',
			avAuthorised: false,
		});

		const result = await service.checkOperator('TEST');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('not authorised');
	});

	it('should return PASS for a valid operator', async () => {
		mockProvider.findOperator.mockResolvedValue({
			operatorFound: true,
			operatorName: 'Waymo UK Ltd',
			licenceNumber: 'PHV-AV-00123',
			licenceExpiry: '2028-12-31',
			avAuthorised: true,
		});

		const result = await service.checkOperator('AV01XYZ');

		expect(result.status).toBe(CheckStatus.PASS);
		expect(result.details.operatorName).toBe('Waymo UK Ltd');
	});

	it('should return NEEDS_REVIEW when licence is expiring soon', async () => {
		const soon = new Date();
		soon.setDate(soon.getDate() + 7);

		mockProvider.findOperator.mockResolvedValue({
			operatorFound: true,
			operatorName: 'AutoRide UK Ltd',
			licenceNumber: 'PHV-AV-00321',
			licenceExpiry: soon.toISOString().slice(0, 10),
			avAuthorised: true,
		});

		const result = await service.checkOperator('AV06MNO');

		expect(result.status).toBe(CheckStatus.NEEDS_REVIEW);
		expect(result.reason).toContain('expiring');
	});

	it('should return FAIL when licence has expired', async () => {
		mockProvider.findOperator.mockResolvedValue({
			operatorFound: true,
			operatorName: 'Expired Corp',
			licenceNumber: 'PHV-AV-00999',
			licenceExpiry: '2020-01-01',
			avAuthorised: true,
		});

		const result = await service.checkOperator('TEST');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('expired');
	});
});
