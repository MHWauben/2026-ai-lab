import 'reflect-metadata';
import { ResponseInterceptor } from '@interceptor/ResponseInterceptor';
import { BeforeMiddleware } from '@middleware/BeforeMiddleware';
import { CustomErrorMiddleware } from '@middleware/CustomErrorMiddleware';
import { NotFoundMiddleware } from '@middleware/NotFoundMiddleware';
import { ComplianceResource } from '@resources/ComplianceResource';
import { ReportResource } from '@resources/ReportResource';
import { VersionResource } from '@resources/VersionResource';
import { createExpressServer, useContainer } from 'routing-controllers';
import serverless from 'serverless-http';
import { Container } from 'typedi';

// This line tells routing-controllers to use `type-di` container
useContainer(Container);

export const app = createExpressServer({
	cors: true,
	defaultErrorHandler: false,
	controllers: [ComplianceResource, ReportResource, VersionResource],
	interceptors: [ResponseInterceptor],
	middlewares: [BeforeMiddleware, CustomErrorMiddleware, NotFoundMiddleware],
});

if (process.env.IS_OFFLINE === 'true') {
	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		// biome-ignore lint/suspicious/noConsole: console allowed for local development
		console.log(`Server running on port ${port}`);
	});
}

export const handler = serverless(app);
