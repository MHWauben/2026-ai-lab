import type { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { ErrorEnum } from '@domain/enums/Error.enum';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Response as response } from '@domain/http/Response';
import { plateSchema } from '@domain/validators/compliance-check';
import { ComplianceService } from '@services/ComplianceService';
import { Get, JsonController, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container, Inject, Service } from 'typedi';

@Service()
@JsonController('/compliance')
export class ComplianceResource {
	private readonly logger: Logger = Container.get(LOGGER);

	constructor(@Inject() private readonly complianceService: ComplianceService) {}

	@Get('/:plate')
	@OpenAPI({
		description: 'Check compliance of an autonomous vehicle by licence plate',
		tags: ['Compliance'],
	})
	async checkCompliance(@Param('plate') plate: string) {
		try {
			this.logger.appendPersistentKeys({ plate });
			this.logger.debug('Calling `checkCompliance`');

			const parsed = plateSchema.safeParse(plate);
			if (!parsed.success) {
				return response.status(HttpStatus.BAD_REQUEST).payload({
					message: ErrorEnum.VALIDATION,
					errors: parsed.error.issues.map((i) => i.message),
				});
			}

			const report = await this.complianceService.checkCompliance(parsed.data);

			if (report.overallStatus === CheckStatus.UNKNOWN) {
				this.logger.info('Vehicle not found');
				return response.status(HttpStatus.NOT_FOUND).payload(report);
			}

			this.logger.info('Compliance check complete', { overallStatus: report.overallStatus });
			return response.status(HttpStatus.OK).payload(report);
		} catch (err) {
			this.logger.error('[ERROR]: checkCompliance', { err });
			return response.status(HttpStatus.INTERNAL_SERVER_ERROR).payload({
				message: ErrorEnum.INTERNAL_SERVER_ERROR,
				error: ErrorEnum.ERROR_OCCURRED,
			});
		}
	}
}
