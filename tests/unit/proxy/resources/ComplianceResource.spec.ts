import { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { ComplianceResource } from '@resources/ComplianceResource';
import { ComplianceService } from '@services/ComplianceService';
import { Container } from 'typedi';
import { AWSPowerToolsLoggerMock } from '@/tests/mocks/packages/power-tools-logger.mock';
import { ComplianceServiceMock } from '@/tests/mocks/services/ComplianceService.mock';

jest.mock('@services/ComplianceService');

describe('ComplianceResource', () => {
	let resource: ComplianceResource;
	let mockService: jest.Mocked<ComplianceService>;
	let mockLogger: jest.Mocked<Logger>;

	beforeEach(() => {
		Container.set(ComplianceService, new ComplianceServiceMock());
		Container.set(LOGGER, AWSPowerToolsLoggerMock.factory.LoggerDI);

		mockService = Container.get(ComplianceService) as jest.Mocked<ComplianceService>;
		mockLogger = Container.get(LOGGER) as jest.Mocked<Logger>;

		resource = new ComplianceResource(mockService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('checkCompliance', () => {
		it('should return 200 for a compliant vehicle', async () => {
			mockService.checkCompliance.mockResolvedValue({
				plate: 'AV01 XYZ',
				checkedAt: '2026-04-16T10:00:00.000Z',
				overallStatus: CheckStatus.PASS,
				checks: {
					registration: { status: CheckStatus.PASS, details: {} as any },
					operator: { status: CheckStatus.PASS, details: {} as any },
					zone: { status: CheckStatus.PASS, details: {} as any },
				},
			});

			const result = await resource.checkCompliance('AV01XYZ');

			expect(result.statusCode).toBe(200);
			expect(mockLogger.info).toHaveBeenCalledWith('Compliance check complete', expect.any(Object));
		});

		it('should return 200 for a non-compliant vehicle (FAIL)', async () => {
			mockService.checkCompliance.mockResolvedValue({
				plate: 'AV02 ABC',
				checkedAt: '2026-04-16T10:00:00.000Z',
				overallStatus: CheckStatus.FAIL,
				checks: {
					registration: { status: CheckStatus.PASS, details: {} as any },
					operator: { status: CheckStatus.FAIL, details: {} as any, reason: 'No operator' },
					zone: { status: CheckStatus.PASS, details: {} as any },
				},
			});

			const result = await resource.checkCompliance('AV02ABC');

			expect(result.statusCode).toBe(200);
		});

		it('should return 404 for an unknown vehicle', async () => {
			mockService.checkCompliance.mockResolvedValue({
				plate: 'XX99 ZZZ',
				checkedAt: '2026-04-16T10:00:00.000Z',
				overallStatus: CheckStatus.UNKNOWN,
				message: 'Vehicle not found in any register',
			});

			const result = await resource.checkCompliance('XX99ZZZ');

			expect(result.statusCode).toBe(404);
			expect(mockLogger.info).toHaveBeenCalledWith('Vehicle not found');
		});

		it('should return 400 for an invalid plate', async () => {
			const result = await resource.checkCompliance('!!!');

			expect(result.statusCode).toBe(400);
			expect(mockService.checkCompliance).not.toHaveBeenCalled();
		});

		it('should return 400 for an empty plate', async () => {
			const result = await resource.checkCompliance('');

			expect(result.statusCode).toBe(400);
		});

		it('should return 500 on service error', async () => {
			mockService.checkCompliance.mockRejectedValue(new Error('DB connection failed'));

			const result = await resource.checkCompliance('AV01XYZ');

			expect(result.statusCode).toBe(500);
			expect(mockLogger.error).toHaveBeenCalled();
		});
	});
});
