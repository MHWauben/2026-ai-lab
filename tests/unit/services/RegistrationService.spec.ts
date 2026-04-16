import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { RegistrationProvider } from '@providers/RegistrationProvider';
import { RegistrationService } from '@services/RegistrationService';
import { Container } from 'typedi';
import { RegistrationProviderMock } from '@/tests/mocks/providers/RegistrationProvider.mock';

jest.mock('@providers/RegistrationProvider');

describe('RegistrationService', () => {
	let service: RegistrationService;
	let mockProvider: jest.Mocked<RegistrationProvider>;

	beforeEach(() => {
		Container.set(RegistrationProvider, new RegistrationProviderMock());
		mockProvider = Container.get(RegistrationProvider) as jest.Mocked<RegistrationProvider>;
		service = new RegistrationService(mockProvider);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return UNKNOWN when vehicle not found', async () => {
		mockProvider.findRegistration.mockResolvedValue(null);

		const result = await service.checkRegistration('XX99ZZZ');

		expect(result.status).toBe(CheckStatus.UNKNOWN);
		expect(result.details).toBeNull();
	});

	it('should return PASS for a fully compliant vehicle', async () => {
		mockProvider.findRegistration.mockResolvedValue({
			make: 'Jaguar',
			model: 'I-PACE AV',
			year: 2025,
			motExpiry: '2027-03-15',
			avTypeApproval: 'UKAV-2025-0042',
			insuranceStatus: 'ACTIVE',
			insurer: 'AV Mutual Ltd',
		});

		const result = await service.checkRegistration('AV01XYZ');

		expect(result.status).toBe(CheckStatus.PASS);
		expect(result.details?.make).toBe('Jaguar');
	});

	it('should return FAIL when MOT has expired', async () => {
		mockProvider.findRegistration.mockResolvedValue({
			make: 'Volvo',
			model: 'EX90 AV',
			year: 2024,
			motExpiry: '2025-01-15',
			avTypeApproval: 'UKAV-2024-0201',
			insuranceStatus: 'ACTIVE',
			insurer: 'Fleet Protect Ltd',
		});

		const result = await service.checkRegistration('AV04GHI');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('MOT');
	});

	it('should return NEEDS_REVIEW when insurance is pending', async () => {
		mockProvider.findRegistration.mockResolvedValue({
			make: 'Audi',
			model: 'e-tron AV',
			year: 2025,
			motExpiry: '2027-05-01',
			avTypeApproval: 'UKAV-2025-0112',
			insuranceStatus: 'PENDING',
			insurer: null,
		});

		const result = await service.checkRegistration('AV06MNO');

		expect(result.status).toBe(CheckStatus.NEEDS_REVIEW);
		expect(result.reason).toContain('insurance');
	});

	it('should return FAIL when insurance is not active', async () => {
		mockProvider.findRegistration.mockResolvedValue({
			make: 'Test',
			model: 'Test',
			year: 2025,
			motExpiry: '2027-05-01',
			avTypeApproval: 'UKAV-2025-0001',
			insuranceStatus: 'EXPIRED',
			insurer: null,
		});

		const result = await service.checkRegistration('TEST');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('Insurance');
	});

	it('should return FAIL when no AV type approval', async () => {
		mockProvider.findRegistration.mockResolvedValue({
			make: 'Test',
			model: 'Test',
			year: 2025,
			motExpiry: '2027-05-01',
			avTypeApproval: null,
			insuranceStatus: 'ACTIVE',
			insurer: 'Test Ltd',
		});

		const result = await service.checkRegistration('TEST');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('AV type approval');
	});
});
