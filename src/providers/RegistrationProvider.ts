import type { RegistrationDetails } from '@domain/models/RegistrationCheckModel';
import { MOCK_VEHICLES } from '@providers/MockDataStore';
import { Service } from 'typedi';

@Service()
export class RegistrationProvider {
	async findRegistration(plate: string): Promise<RegistrationDetails | null> {
		const vehicle = MOCK_VEHICLES[plate];
		return vehicle?.registration ?? null;
	}
}
