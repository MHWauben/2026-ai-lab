import { LOGGER } from '@domain/di-tokens/Tokens';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import type { NextFunction, Request, Response } from 'express';
import { type ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Container, Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
	use({ method, path }: Request, res: Response, next: NextFunction) {
		if (!res.headersSent) {
			const logger = Container.get(LOGGER);

			logger.error('[ERROR]: NotFoundMiddleware', `Route '${path}' not found for ${method}`);

			return res.status(HttpStatus.NOT_FOUND).send({ message: `Route '${path}' not found for ${method}` });
		}
		next();
	}
}
