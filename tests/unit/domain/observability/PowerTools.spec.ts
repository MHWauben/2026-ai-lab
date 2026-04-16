import { Logger, LogLevel } from '@aws-lambda-powertools/logger';
import { PowerTools } from '@domain/observability/PowerTools';

jest.mock('@aws-lambda-powertools/logger', () => ({
	...jest.requireActual('@aws-lambda-powertools/logger'),
	Logger: jest.fn(),
}));

describe('PowerTools', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(PowerTools as unknown as { logger?: Logger }).logger = undefined;
	});

	it('should create a new Logger instance if not already created with provided service name', () => {
		const serviceName = 'TestService';
		const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

		PowerTools.get(serviceName);

		expect(Logger).toHaveBeenCalledWith({
			serviceName: serviceName,
			logLevel: LogLevel.DEBUG,
		});

		consoleSpy.mockRestore();
	});

	it('should reuse existing Logger instance if already created', () => {
		const serviceName1 = 'TestService1';
		const serviceName2 = 'TestService2';

		// First call should create a new instance
		const result1 = PowerTools.get(serviceName1);
		expect(Logger).toHaveBeenCalledTimes(1);

		// Second call should reuse the existing instance
		const result2 = PowerTools.get(serviceName2);
		expect(Logger).toHaveBeenCalledTimes(1);
		expect(result1.logger).toBe(result2.logger);
	});

	it('should use log level from environment variable if set', () => {
		process.env.LOG_LEVEL = 'info';
		const serviceName = 'TestService';

		PowerTools.get(serviceName);

		expect(Logger).toHaveBeenCalledWith({
			serviceName: serviceName,
			logLevel: LogLevel.INFO,
		});

		process.env.LOG_LEVEL = undefined; // Clean up
	});

	it('should handle inconsistent casing of the LOG_LEVEL env variable', () => {
		process.env.LOG_LEVEL = 'CriTicaL';
		const serviceName = 'TestService';

		PowerTools.get(serviceName);

		expect(Logger).toHaveBeenCalledWith({
			serviceName: serviceName,
			logLevel: LogLevel.CRITICAL,
		});

		process.env.LOG_LEVEL = undefined; // Clean up
	});

	it('should default log level to debug if environment variable is not set', () => {
		process.env.LOG_LEVEL = undefined;
		const serviceName = 'TestService';

		PowerTools.get(serviceName);

		expect(Logger).toHaveBeenCalledWith({
			serviceName: serviceName,
			logLevel: LogLevel.DEBUG,
		});
	});
});
