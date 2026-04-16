import type { APIGatewayProxyResult } from 'aws-lambda';
import type { Response } from 'express';
import { Interceptor, type InterceptorInterface } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
	intercept({ response }: { response: Response }, content: Partial<APIGatewayProxyResult>) {
		for (const [header, value] of Object.entries(content?.headers || {})) {
			// set each header individually
			response.setHeader(header, value as string);
		}

		// check for a body and statusCode
		if (content?.statusCode && content?.body) {
			// set the status code
			response.status(content.statusCode);

			// set the response body
			response.json(JSON.parse(content.body));
		}

		// return the response object in the form routing-controllers expects
		return response;
	}
}
