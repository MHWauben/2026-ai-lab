import { Priority } from '@domain/enums/MiddlewarePriority.enum';
import { APIGatewayModel } from '@domain/models/APIGatewayModel';
import { PowerTools } from '@domain/observability/PowerTools';
import type { NextFunction, Request, Response } from 'express';
import { type ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { name } from '@/package.json';

@Service()
@Middleware({ type: 'before', priority: Priority.HIGHEST })
export class BeforeMiddleware implements ExpressMiddlewareInterface {
	async use(req: Request, _res: Response, next: NextFunction) {
		const { logger } = PowerTools.get(name);

		const lambdaContext = (req as Request & { apiGateway: APIGatewayModel })?.apiGateway?.context;

		if (lambdaContext) {
			logger.addContext(lambdaContext);
		}

		// clear down persistent keys to ensure the request don't bleed into one another
		logger.removePersistentKeys(Object.keys(logger.getPersistentLogAttributes()));

		// if there is no 'app-version' header, setting it to null will exclude it from the logs
		logger.appendPersistentKeys({ appVersion: req.get('app-version') ?? null });

		logger.debug('BeforeMiddleware: Finished.');
		next();
	}
}
