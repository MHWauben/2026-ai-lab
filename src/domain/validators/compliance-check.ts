import { z } from 'zod';

export const plateSchema = z
	.string()
	.trim()
	.min(1, 'Plate cannot be empty')
	.transform((val) => val.toUpperCase().replace(/\s/g, ''))
	.refine((val) => /^[A-Z]{2}\d{2}[A-Z]{3}$/.test(val), {
		message: 'Plate must be a valid UK vehicle registration format',
	});
