import type { OperatorDetails } from '@domain/models/OperatorCheckModel';
import { MOCK_VEHICLES } from '@providers/MockDataStore';
import { Service } from 'typedi';

@Service()
export class OperatorProvider {
	async findOperator(plate: string): Promise<OperatorDetails | null> {
		const vehicle = MOCK_VEHICLES[plate];
		return vehicle?.operator ?? null;
	}
}
