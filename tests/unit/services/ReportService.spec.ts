import { ReportReason } from '@domain/enums/ReportReason.enum';
import type { VehicleReport } from '@domain/models/VehicleReportModel';
import { ReportService } from '@services/ReportService';

describe('ReportService', () => {
	let service: ReportService;

	beforeEach(() => {
		service = new ReportService();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should generate a report ID and return RECEIVED status', async () => {
		const report = {
			plate: 'AV02 ABC',
			location: { lat: 51.5054, lng: -0.0235 },
			reason: ReportReason.NO_OPERATOR,
			description: 'No operator visible',
		} as VehicleReport;

		const result = await service.submitReport(report);

		expect(result.reportId).toMatch(/^RPT-\d{8}-\d{3}$/);
		expect(result.status).toBe('RECEIVED');
	});

	it('should increment report IDs', async () => {
		const report = {
			plate: 'AV02 ABC',
			location: { lat: 51.5054, lng: -0.0235 },
			reason: ReportReason.NO_OPERATOR,
		} as VehicleReport;

		const result1 = await service.submitReport(report);
		const result2 = await service.submitReport(report);

		const id1 = Number.parseInt(result1.reportId.split('-')[2], 10);
		const id2 = Number.parseInt(result2.reportId.split('-')[2], 10);
		expect(id2).toBe(id1 + 1);
	});
});
