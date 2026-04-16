import { Logger, LogLevel } from '@aws-lambda-powertools/logger';
import { LOGGER } from '@domain/di-tokens/Tokens';
import { Container } from 'typedi';

export class PowerTools {
	private static logger: Logger;

	static get(serviceName: string) {
		// singleton style setup to attempt to reuse instance(s)
		if (!PowerTools.logger) {
			const logLevel = process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel;

			PowerTools.logger = new Logger({
				serviceName: serviceName,
				// check the env var is defined and is one of the allowed values, otherwise default to DEBUG
				logLevel: logLevel && logLevel in LogLevel ? logLevel : LogLevel.DEBUG,
			});

			// store power-tools logger instance in the container
			Container.set(LOGGER, PowerTools.logger);
		}

		return { logger: PowerTools.logger };
	}
}
