import type { Logger } from '@aws-lambda-powertools/logger';
import { Token } from 'typedi';

export const LOGGER = new Token<Logger>('LOGGER');
