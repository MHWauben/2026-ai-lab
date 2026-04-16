import type { HttpStatus } from '@domain/enums/HttpStatus.enum';
import type { APIGatewayProxyResult } from 'aws-lambda';

export class Response {
	/**
	 * Response object creation helper
	 * @param {HttpStatus} statusCode - Defaults to 'OK' / 200 status
	 * @returns {JsonResponse}
	 */
	static status(statusCode: HttpStatus): JsonResponse {
		return new JsonResponse(statusCode);
	}
}

export class JsonResponse {
	private responseHeaders: Record<string, unknown> = {};
	private static readonly OriginHeader = {
		AllowAll: {
			'Access-Control-Allow-Origin': '*' as const,
		},
	};

	constructor(private statusCode: HttpStatus) {}

	/**
	 * Add headers object to the response object
	 */
	headers(headers: Record<string, unknown>): JsonResponse {
		this.responseHeaders = { ...this.responseHeaders, ...headers };
		return this;
	}

	/**
	 * Add a payload to the response object
	 * @param body - Response body which will be stringified if it's not null
	 * @returns {APIGatewayProxyResult}
	 */
	payload<T>(body: T): APIGatewayProxyResult {
		return {
			statusCode: this.statusCode,
			body: !body ? null : JSON.stringify(body),
			headers: {
				...JsonResponse.OriginHeader.AllowAll,
				...this.responseHeaders,
			},
		} as APIGatewayProxyResult;
	}
}
