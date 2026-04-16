import { z } from 'zod';

export const vehicleReportSchema = z.object({
	plate: z
		.string()
		.trim()
		.min(1)
		.regex(/^[A-Z]{2}\d{2}\s?[A-Z]{3}$/),
	location: z.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
	}),
	reason: z.enum(['NO_OPERATOR', 'NO_REGISTRATION', 'WRONG_ZONE', 'OTHER']),
	description: z.string().max(500).optional(),
});
