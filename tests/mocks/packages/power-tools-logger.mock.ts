export class AWSPowerToolsLoggerMock {
	private static logger = {
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		appendPersistentKeys: jest.fn(),
		addContext: jest.fn(),
		getPersistentLogAttributes: jest.fn().mockReturnValue({ key: 'value' }),
		removePersistentKeys: jest.fn(),
		injectLambdaContext: jest
			.fn()
			.mockReturnValue((_target: unknown, _propertyKey: unknown, descriptor: unknown) => descriptor),
	};

	static factory = {
		LoggerInstantiation: jest.fn().mockImplementation(() => this.logger),
		LoggerDI: this.logger,
	};
}
