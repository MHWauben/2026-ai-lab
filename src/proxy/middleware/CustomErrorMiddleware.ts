import { LOGGER } from '@domain/di-tokens/Tokens';
import { ErrorEnum } from '@domain/enums/Error.enum';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Priority } from '@domain/enums/MiddlewarePriority.enum';
import { CustomError } from '@domain/models/CustomError';
import type { ValidationError } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, type ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { Container, Service } from 'typedi';

@Service()
@Middleware({ type: 'after', priority: Priority.MEDIUM })
export class CustomErrorMiddleware implements ExpressErrorMiddlewareInterface {
	private static readonly ValueSanitiserRegExp = /\(.*?\)/g;
	private static readonly isRequired = 'is required';

	error(error: unknown, _request: Request, response: Response, next: NextFunction) {
		const logger = Container.get(LOGGER);

		if (
			error instanceof HttpError &&
			(error.name === 'ParamNormalizationError' || error.name === 'ParameterParseJsonError')
		) {
			logger.error('[ERROR]: CustomErrorMiddleware - instanceof HttpError & ParamError', { error });

			return response.status(error.httpCode).send({
				message: ErrorEnum.VALIDATION,
				error: error.message.replace(CustomErrorMiddleware.ValueSanitiserRegExp, 'supplied'),
			});
		}

		if (error instanceof HttpError && error.name === 'ParamRequiredError') {
			logger.error('[ERROR]: CustomErrorMiddleware - instanceof HttpError & ParamRequiredError', { error });

			const [err] = error.message.split(CustomErrorMiddleware.isRequired);

			return response.status(error.httpCode).send({
				message: ErrorEnum.VALIDATION,
				error: `${err?.trim()} ${CustomErrorMiddleware.isRequired}.`,
			});
		}

		if (error instanceof BadRequestError) {
			logger.error('[ERROR]: CustomErrorMiddleware - instanceof BadRequestError', { error });

			const requestError = error as BadRequestError & { errors: ValidationError[] };

			return response.status(requestError.httpCode).send({
				message: ErrorEnum.VALIDATION,
				errors: requestError.errors.flatMap(CustomErrorMiddleware.flattenErrors),
			});
		}

		if (error instanceof CustomError) {
			logger.error('[ERROR]: CustomErrorMiddleware - instanceof CustomError', { error });

			return response.status(error.statusCode).send({
				message: ErrorEnum.VALIDATION,
				error: error.message,
			});
		}

		if (error instanceof Error) {
			logger.error('[ERROR]: CustomErrorMiddleware - instanceof Error', error);

			return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				message: ErrorEnum.INTERNAL_SERVER_ERROR,
				error: ErrorEnum.ERROR_OCCURRED,
			});
		}

		// This is log for anything that falls through the cracks. This should never in theory run, although it would
		// give visibility of errors that are not being caught correctly.
		logger.error('[ERROR]: CustomErrorMiddleware - Uncaught error', error as Error);

		next(error);
	}

	private static flattenErrors(item: ValidationError): string[] {
		let errors: string[] = [];

		// check if 'constraints' exist, if they do, then add them to the errors array
		if (item.constraints) {
			errors = errors.concat(Object.values(item.constraints));
		}

		// check if `children` exist, this will occur if there are nested validators
		if (Array.isArray(item.children)) {
			// loop through each child and call `flattenErrors` recursively
			for (const child of item.children) {
				errors = errors.concat(CustomErrorMiddleware.flattenErrors(child));
			}
		}

		return errors;
	}
}
