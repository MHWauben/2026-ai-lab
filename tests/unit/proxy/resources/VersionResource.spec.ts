import { Logger } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { VersionResource } from '@resources/VersionResource';
import { VersionService } from '@services/VersionService';
import { Container } from 'typedi';
import { AWSPowerToolsLoggerMock } from '@/tests/mocks/packages/power-tools-logger.mock';
import { VersionServiceMock } from '@/tests/mocks/services/VersionService.mock';

jest.mock('@services/VersionService');

describe('VersionResource', () => {
	let mockResource: VersionResource;
	let mockService: jest.Mocked<VersionService>;
	let mockLogger: jest.Mocked<Logger>;

	beforeEach(() => {
		// set the mock implementation
		Container.set(VersionService, new VersionServiceMock());
		Container.set(LOGGER, AWSPowerToolsLoggerMock.factory.LoggerDI);

		// get the mock service from the container
		mockService = Container.get(VersionService) as jest.Mocked<VersionService>;
		mockLogger = Container.get(LOGGER) as jest.Mocked<Logger>;

		// inject the mock service into the resource
		mockResource = new VersionResource(mockService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getVersion', () => {
		it('should return 200 response', async () => {
			// ACT
			const response = mockResource.getVersion();

			// ASSERT
			expect(mockLogger.debug).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
			expect(response.statusCode).toEqual(200);
		});
	});
});
