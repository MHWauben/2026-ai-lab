import type { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { ErrorEnum } from '@domain/enums/Error.enum';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Response as response } from '@domain/http/Response';
import { VehicleReport } from '@domain/models/VehicleReportModel';
import { ReportService } from '@services/ReportService';
import { Body, HttpCode, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container, Inject, Service } from 'typedi';

@Service()
@JsonController('/compliance')
export class ReportResource {
	private readonly logger: Logger = Container.get(LOGGER);

	constructor(@Inject() private readonly reportService: ReportService) {}

	@Post('/report')
	@HttpCode(HttpStatus.CREATED)
	@OpenAPI({
		description: 'Submit a public report for a non-compliant autonomous vehicle',
		tags: ['Reporting'],
	})
	async reportVehicle(@Body({ validate: true }) report: VehicleReport) {
		try {
			this.logger.appendPersistentKeys({ plate: report.plate });
			this.logger.debug('Calling `submitReport`');

			const result = await this.reportService.submitReport(report);

			this.logger.info('Report submitted', { reportId: result.reportId });
			return response.status(HttpStatus.CREATED).payload({
				reportId: result.reportId,
				plate: report.plate,
				status: result.status,
				message: `Report submitted successfully. Reference: ${result.reportId}`,
			});
		} catch (err) {
			this.logger.error('[ERROR]: reportVehicle', { err });
			return response.status(HttpStatus.INTERNAL_SERVER_ERROR).payload({
				message: ErrorEnum.INTERNAL_SERVER_ERROR,
				error: ErrorEnum.ERROR_OCCURRED,
			});
		}
	}
}
