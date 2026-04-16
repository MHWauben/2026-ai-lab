import type { VehicleReport } from '@domain/models/VehicleReportModel';
import { Service } from 'typedi';

let reportCounter = 0;

@Service()
export class ReportService {
	async submitReport(report: VehicleReport): Promise<{ reportId: string; status: string }> {
		reportCounter++;
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const reportId = `RPT-${date}-${String(reportCounter).padStart(3, '0')}`;

		return {
			reportId,
			status: 'RECEIVED',
		};
	}
}
