import { ResponseInterceptor } from '@interceptor/ResponseInterceptor';
import { Response } from 'express';

describe('ResponseInterceptor', () => {
	let interceptor: ResponseInterceptor;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		interceptor = new ResponseInterceptor();
		mockResponse = {
			setHeader: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	it('should set headers correctly', () => {
		const content = {
			headers: {
				'Content-Type': 'application/json',
				'X-Custom-Header': 'Custom Value',
			},
		};

		interceptor.intercept({ response: mockResponse as Response }, content);

		expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
		expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'Custom Value');
	});

	it('should handle empty headers correctly', () => {
		const content = {
			headers: {},
		};

		interceptor.intercept({ response: mockResponse as Response }, content);

		expect(mockResponse.setHeader).not.toHaveBeenCalled();
	});

	it('should set status code and body correctly', () => {
		const content = {
			statusCode: 200,
			body: JSON.stringify({ message: 'Success' }),
		};

		interceptor.intercept({ response: mockResponse as Response }, content);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Success' });
	});

	it('should handle content without headers', () => {
		const content = {
			statusCode: 204,
			body: JSON.stringify({}),
		};

		interceptor.intercept({ response: mockResponse as Response }, content);

		expect(mockResponse.setHeader).not.toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(204);
		expect(mockResponse.json).toHaveBeenCalledWith({});
	});

	it('should handle content without status code and body', () => {
		const content = {
			headers: {
				'X-Test': 'Test',
			},
		};

		interceptor.intercept({ response: mockResponse as Response }, content);

		expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Test', 'Test');
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
	});

	it('should return the response object', () => {
		const content = {};
		const result = interceptor.intercept({ response: mockResponse as Response }, content);

		expect(result).toBe(mockResponse);
	});
});
