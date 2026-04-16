import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { ZoneCheckResult } from '@domain/models/ZoneCheckModel';
import { ZoneProvider } from '@providers/ZoneProvider';
import { Inject, Service } from 'typedi';

@Service()
export class ZoneService {
	constructor(@Inject() private readonly zoneProvider: ZoneProvider) {}

	async checkZone(plate: string): Promise<ZoneCheckResult> {
		const details = await this.zoneProvider.checkZone(plate);

		if (!details) {
			return { status: CheckStatus.UNKNOWN, details: null, reason: 'Vehicle not found in register' };
		}

		if (!details.zoneName) {
			return { status: CheckStatus.FAIL, details, reason: 'Vehicle is not in a designated AV operation zone' };
		}

		if (!details.zoneActive) {
			return {
				status: CheckStatus.FAIL,
				details,
				reason: 'Vehicle is in a designated zone but the zone is not currently active',
			};
		}

		return { status: CheckStatus.PASS, details };
	}
}
