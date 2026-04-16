import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { ComplianceService } from '@services/ComplianceService';
import { OperatorService } from '@services/OperatorService';
import { RegistrationService } from '@services/RegistrationService';
import { ZoneService } from '@services/ZoneService';
import { Container } from 'typedi';
import { OperatorServiceMock } from '@/tests/mocks/services/OperatorService.mock';
import { RegistrationServiceMock } from '@/tests/mocks/services/RegistrationService.mock';
import { ZoneServiceMock } from '@/tests/mocks/services/ZoneService.mock';

jest.mock('@services/RegistrationService');
jest.mock('@services/OperatorService');
jest.mock('@services/ZoneService');

describe('ComplianceService', () => {
	let service: ComplianceService;
	let mockRegistration: jest.Mocked<RegistrationService>;
	let mockOperator: jest.Mocked<OperatorService>;
	let mockZone: jest.Mocked<ZoneService>;

	beforeEach(() => {
		Container.set(RegistrationService, new RegistrationServiceMock());
		Container.set(OperatorService, new OperatorServiceMock());
		Container.set(ZoneService, new ZoneServiceMock());

		mockRegistration = Container.get(RegistrationService) as jest.Mocked<RegistrationService>;
		mockOperator = Container.get(OperatorService) as jest.Mocked<OperatorService>;
		mockZone = Container.get(ZoneService) as jest.Mocked<ZoneService>;

		service = new ComplianceService(mockRegistration, mockOperator, mockZone);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return PASS when all checks pass', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		const result = await service.checkCompliance('AV01XYZ');

		expect(result.overallStatus).toBe(CheckStatus.PASS);
		expect(result.checks).toBeDefined();
		expect(result.plate).toBe('AV01 XYZ');
	});

	it('should return FAIL when operator check fails (no operator)', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({
			status: CheckStatus.FAIL,
			details: {
				operatorFound: false,
				operatorName: null,
				licenceNumber: null,
				licenceExpiry: null,
				avAuthorised: false,
			},
			reason: 'No private hire operator is linked to this vehicle',
		});
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		const result = await service.checkCompliance('AV02ABC');

		expect(result.overallStatus).toBe(CheckStatus.FAIL);
		expect(result.checks?.operator.status).toBe(CheckStatus.FAIL);
		expect(result.checks?.operator.reason).toContain('No private hire operator');
	});

	it('should return FAIL when multiple checks fail', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({
			status: CheckStatus.FAIL,
			details: {} as any,
			reason: 'No operator',
		});
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.FAIL, details: {} as any, reason: 'Wrong zone' });

		const result = await service.checkCompliance('AV03DEF');

		expect(result.overallStatus).toBe(CheckStatus.FAIL);
	});

	it('should return UNKNOWN when all checks are unknown', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.UNKNOWN, details: null });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.UNKNOWN, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.UNKNOWN, details: null });

		const result = await service.checkCompliance('XX99ZZZ');

		expect(result.overallStatus).toBe(CheckStatus.UNKNOWN);
		expect(result.message).toBe('Vehicle not found in any register');
		expect(result.checks).toBeUndefined();
	});

	it('should return NEEDS_REVIEW when no failures but a review is needed', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.NEEDS_REVIEW, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.NEEDS_REVIEW, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		const result = await service.checkCompliance('AV06MNO');

		expect(result.overallStatus).toBe(CheckStatus.NEEDS_REVIEW);
	});

	it('should return FAIL over NEEDS_REVIEW', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.FAIL, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.NEEDS_REVIEW, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		const result = await service.checkCompliance('TEST');

		expect(result.overallStatus).toBe(CheckStatus.FAIL);
	});

	it('should format the plate with a space', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		const result = await service.checkCompliance('AV01XYZ');

		expect(result.plate).toBe('AV01 XYZ');
	});

	it('should run all checks in parallel', async () => {
		mockRegistration.checkRegistration.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockOperator.checkOperator.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });
		mockZone.checkZone.mockResolvedValue({ status: CheckStatus.PASS, details: {} as any });

		await service.checkCompliance('AV01XYZ');

		expect(mockRegistration.checkRegistration).toHaveBeenCalledWith('AV01XYZ');
		expect(mockOperator.checkOperator).toHaveBeenCalledWith('AV01XYZ');
		expect(mockZone.checkZone).toHaveBeenCalledWith('AV01XYZ');
	});
});
