import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { JsonResponse, Response } from '@domain/http/Response';

describe('Response and JsonResponse', () => {
	describe('Response.status', () => {
		it('should create JsonResponse with given status', () => {
			const jsonResponse = Response.status(HttpStatus.OK);
			expect(jsonResponse).toBeInstanceOf(JsonResponse);
			expect(jsonResponse).toHaveProperty('statusCode', HttpStatus.OK);
		});
	});

	describe('JsonResponse', () => {
		let jsonResponse: JsonResponse;

		beforeEach(() => {
			jsonResponse = new JsonResponse(HttpStatus.OK);
		});

		it('should add headers correctly', () => {
			const headers = { 'Content-Type': 'application/json' };
			const responseWithHeaders = jsonResponse.headers(headers).payload({});
			expect(jsonResponse).toBeInstanceOf(JsonResponse);
			expect(responseWithHeaders).toHaveProperty('headers', {
				...{ 'Access-Control-Allow-Origin': '*' },
				...headers,
			});
		});

		it('should add and merge headers correctly', () => {
			const initialHeaders = { 'Content-Type': 'application/json' };
			jsonResponse.headers(initialHeaders);

			// Additional headers to test merging behavior
			const additionalHeaders = { 'X-Custom-Header': 'TestValue' };
			jsonResponse.headers(additionalHeaders);

			const finalResponse = jsonResponse.payload({});

			// Check that initial headers are present and correctly merged with additional ones
			expect(finalResponse.headers).toEqual({
				'Access-Control-Allow-Origin': '*', // Default CORS header
				'Content-Type': 'application/json',
				'X-Custom-Header': 'TestValue',
			});
		});

		it('should create payload with the correct properties', () => {
			const body = { message: 'Success' };
			const apiResponse = jsonResponse.payload(body);

			expect(apiResponse).toEqual({
				statusCode: HttpStatus.OK,
				body: JSON.stringify(body),
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			});
		});

		it('should handle null body correctly', () => {
			const apiResponse = jsonResponse.payload(null);
			expect(apiResponse.body).toBeNull();
		});
	});
});
