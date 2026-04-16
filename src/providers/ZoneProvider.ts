import type { ZoneDetails } from '@domain/models/ZoneCheckModel';
import { MOCK_VEHICLES } from '@providers/MockDataStore';
import { Service } from 'typedi';

@Service()
export class ZoneProvider {
	async checkZone(plate: string): Promise<ZoneDetails | null> {
		const vehicle = MOCK_VEHICLES[plate];
		return vehicle?.zone ?? null;
	}
}
