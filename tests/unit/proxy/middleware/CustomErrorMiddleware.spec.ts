import { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { ErrorEnum } from '@domain/enums/Error.enum';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { CustomError } from '@domain/models/CustomError';
import { CustomErrorMiddleware } from '@middleware/CustomErrorMiddleware';
import { ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError, HttpError } from 'routing-controllers';
import { Container } from 'typedi';
import { ExpressMock } from '@/tests/mocks/packages/express.mock';
import { AWSPowerToolsLoggerMock } from '@/tests/mocks/packages/power-tools-logger.mock';

type Constraint = { [type: string]: string };

describe('CustomErrorMiddleware', () => {
	const middleware = new CustomErrorMiddleware();
	let mockRequest: Partial<Request>;
	const mockResponse: Partial<Response> = ExpressMock.factory;
	const mockNext: NextFunction = jest.fn();
	let mockLogger: jest.Mocked<Logger>;
	const errorMessage = 'Given parameter staffNumber is invalid. Value ("version1111") cannot be parsed into number.';
	const requiredErrorMessage =
		'Query parameter "euVehicleCategory" is required for request on GET /defects/required-standards';

	beforeEach(() => {
		mockRequest = {};

		// set the logger mock
		Container.set(LOGGER, AWSPowerToolsLoggerMock.factory.LoggerDI);

		// get the mock logger from the container
		mockLogger = Container.get(LOGGER) as jest.Mocked<Logger>;

		jest.clearAllMocks();
	});

	it("should handle HttpError correctly for ParamNormalizationError's", () => {
		const httpError = new HttpError(400, errorMessage);
		httpError.name = 'ParamNormalizationError';

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith(
			'[ERROR]: CustomErrorMiddleware - instanceof HttpError & ParamError',
			{ error: httpError }
		);
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.VALIDATION,
			error: 'Given parameter staffNumber is invalid. Value supplied cannot be parsed into number.',
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should handle HttpError correctly for ParameterParseJsonError's", () => {
		const httpError = new HttpError(400, errorMessage);
		httpError.name = 'ParameterParseJsonError';

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith(
			'[ERROR]: CustomErrorMiddleware - instanceof HttpError & ParamError',
			{ error: httpError }
		);
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.VALIDATION,
			error: 'Given parameter staffNumber is invalid. Value supplied cannot be parsed into number.',
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should handle HttpError correctly for ParamRequiredError's", () => {
		const httpError = new HttpError(400, requiredErrorMessage);
		httpError.name = 'ParamRequiredError';

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith(
			'[ERROR]: CustomErrorMiddleware - instanceof HttpError & ParamRequiredError',
			{ error: httpError }
		);
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.VALIDATION,
			error: 'Query parameter "euVehicleCategory" is required.',
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should handle HttpError correctly for a BadRequestError', () => {
		const httpError = new BadRequestError('Some error message');

		(httpError as BadRequestError & { errors: ValidationError[] }).errors = [
			{ constraints: { email: 'Email is invalid' } as Constraint },
			{ constraints: { staffNumber: 'Must be a minimum of 3 characters' } as Constraint },
		] as ValidationError[];

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith('[ERROR]: CustomErrorMiddleware - instanceof BadRequestError', {
			error: httpError,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.VALIDATION,
			errors: ['Email is invalid', 'Must be a minimum of 3 characters'],
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should handle deeply nested ValidationError structure correctly', () => {
		const httpError = new BadRequestError('Validation failed');

		(httpError as BadRequestError & { errors: ValidationError[] }).errors = [
			{
				target: { payload: { address: {} } },
				property: 'payload',
				children: [
					{
						property: 'transportUndertakingName',
						constraints: {
							maxLength: 'Transport Undertaking Name must be no more than 100 characters.',
						},
					},
					{
						property: 'address',
						children: [
							{
								property: 'line1',
								constraints: {
									isString: 'line1 must be a string',
								},
							},
							{
								property: 'city',
								constraints: {
									isNotEmpty: 'city should not be empty',
								},
							},
						],
					},
				],
			},
		] as ValidationError[];

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith('[ERROR]: CustomErrorMiddleware - instanceof BadRequestError', {
			error: httpError,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.VALIDATION,
			errors: [
				'Transport Undertaking Name must be no more than 100 characters.',
				'line1 must be a string',
				'city should not be empty',
			],
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should handle HttpError correctly for a CustomError', () => {
		const httpError = new CustomError(HttpStatus.BAD_REQUEST, 'Some custom error');
		httpError.name = 'CustomError';

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith('[ERROR]: CustomErrorMiddleware - instanceof CustomError', {
			error: httpError,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.send).toHaveBeenCalledWith({
			error: 'Some custom error',
			message: ErrorEnum.VALIDATION,
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should handle HttpError correctly for Error classes', () => {
		const httpError = new Error('ERROR');
		httpError.name = 'Error';

		middleware.error(httpError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith('[ERROR]: CustomErrorMiddleware - instanceof Error', httpError);
		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.send).toHaveBeenCalledWith({
			message: ErrorEnum.INTERNAL_SERVER_ERROR,
			error: ErrorEnum.ERROR_OCCURRED,
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should call next function for non-HttpError', () => {
		const regularError = {};

		middleware.error(regularError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockLogger.error).toHaveBeenCalledWith(
			'[ERROR]: CustomErrorMiddleware - Uncaught error',
			regularError as Error
		);
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.send).not.toHaveBeenCalled();
	});
});
