import { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { ReportReason } from '@domain/enums/ReportReason.enum';
import { VehicleReport } from '@domain/models/VehicleReportModel';
import { ReportResource } from '@resources/ReportResource';
import { ReportService } from '@services/ReportService';
import { Container } from 'typedi';
import { AWSPowerToolsLoggerMock } from '@/tests/mocks/packages/power-tools-logger.mock';
import { ReportServiceMock } from '@/tests/mocks/services/ReportService.mock';

jest.mock('@services/ReportService');

describe('ReportResource', () => {
	let resource: ReportResource;
	let mockService: jest.Mocked<ReportService>;
	let mockLogger: jest.Mocked<Logger>;

	beforeEach(() => {
		Container.set(ReportService, new ReportServiceMock());
		Container.set(LOGGER, AWSPowerToolsLoggerMock.factory.LoggerDI);

		mockService = Container.get(ReportService) as jest.Mocked<ReportService>;
		mockLogger = Container.get(LOGGER) as jest.Mocked<Logger>;

		resource = new ReportResource(mockService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('reportVehicle', () => {
		it('should return 201 for a valid report', async () => {
			mockService.submitReport.mockResolvedValue({
				reportId: 'RPT-20260416-001',
				status: 'RECEIVED',
			});

			const report = new VehicleReport();
			report.plate = 'AV02 ABC';
			report.location = { lat: 51.5054, lng: -0.0235 } as any;
			report.reason = ReportReason.NO_OPERATOR;
			report.description = 'No operator visible';

			const result = await resource.reportVehicle(report);

			expect(result.statusCode).toBe(201);
			const body = JSON.parse(result.body);
			expect(body.reportId).toBe('RPT-20260416-001');
			expect(body.plate).toBe('AV02 ABC');
			expect(body.message).toContain('RPT-20260416-001');
		});

		it('should return 500 on service error', async () => {
			mockService.submitReport.mockRejectedValue(new Error('Storage failed'));

			const report = new VehicleReport();
			report.plate = 'AV02 ABC';
			report.location = { lat: 51.5054, lng: -0.0235 } as any;
			report.reason = ReportReason.NO_OPERATOR;

			const result = await resource.reportVehicle(report);

			expect(result.statusCode).toBe(500);
			expect(mockLogger.error).toHaveBeenCalled();
		});
	});
});
