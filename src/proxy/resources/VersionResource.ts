import type { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Response as response } from '@domain/http/Response';
import { VersionService } from '@services/VersionService';
import { Get, JsonController } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Container, Inject, Service } from 'typedi';

@Service()
@JsonController('/version')
export class VersionResource {
	private readonly logger: Logger = Container.get(LOGGER);

	constructor(@Inject() private versionService: VersionService) {}

	@Get('')
	@OpenAPI({
		description: 'API for retrieving the version of the service',
		tags: ['Version'],
	})
	getVersion() {
		const versionData = this.versionService.getVersion();

		this.logger.debug('Called `getVersion`', { versionData });

		return response.status(HttpStatus.OK).payload(versionData);
	}
}
