import 'reflect-metadata';

import { AWSPowerToolsLoggerMock } from './tests/mocks/packages/power-tools-logger.mock';
import { TypeDIMock } from './tests/mocks/packages/typedi.mock';

jest.mock('typedi', () => TypeDIMock.factory);
jest.mock('@aws-lambda-powertools/logger', () => AWSPowerToolsLoggerMock.factory.LoggerDI);
