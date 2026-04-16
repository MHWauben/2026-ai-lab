import { APIGatewayModel } from '@domain/models/APIGatewayModel';
import { PowerTools } from '@domain/observability/PowerTools';
import { BeforeMiddleware } from '@middleware/BeforeMiddleware';
import { NextFunction, Request, Response } from 'express';
import { AWSPowerToolsLoggerMock } from '@/tests/mocks/packages/power-tools-logger.mock';

jest.mock('@domain/observability/PowerTools');
jest.mock('@/package.json', () => ({ name: 'test-app' }));

describe('BeforeMiddleware', () => {
	let middleware: BeforeMiddleware;
	let mockReq: Partial<Request> & { apiGateway: APIGatewayModel };
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	const mockLogger = AWSPowerToolsLoggerMock.factory.LoggerDI;

	beforeEach(() => {
		middleware = new BeforeMiddleware();
		mockReq = {
			get: jest.fn(),
			apiGateway: {} as APIGatewayModel,
		};
		mockRes = {};
		mockNext = jest.fn();

		(PowerTools.get as jest.Mock).mockReturnValue({ logger: mockLogger });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should add lambda context to logger if present', async () => {
		const lambdaContext = { awsRequestId: 'test-id' };
		mockReq.apiGateway = { context: lambdaContext } as APIGatewayModel;

		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.addContext).toHaveBeenCalledWith(lambdaContext);
	});

	it('should not add lambda context to logger if not present', async () => {
		(mockReq as unknown as { apiGateway: undefined }).apiGateway = undefined;

		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.addContext).not.toHaveBeenCalled();
	});

	it('should append app-version to persistent keys if present', async () => {
		mockReq.get = jest.fn().mockReturnValue('1.0.0');

		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.appendPersistentKeys).toHaveBeenCalledWith({ appVersion: '1.0.0' });
	});

	it('should set app-version to null if not present', async () => {
		mockReq.get = jest.fn().mockReturnValue(null);

		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.appendPersistentKeys).toHaveBeenCalledWith({ appVersion: null });
	});

	it('should log debug message after processing', async () => {
		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockLogger.debug).toHaveBeenCalledWith('BeforeMiddleware: Finished.');
	});

	it('should call next function after processing', async () => {
		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
	});

	it('should use the correct app name from package.json', async () => {
		await middleware.use(mockReq as Request, mockRes as Response, mockNext);

		expect(PowerTools.get).toHaveBeenCalledWith('test-app');
	});
});
