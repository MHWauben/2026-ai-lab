import type { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { Location } from '@domain/models/LocationModel';

export interface ZoneDetails {
	location: Location;
	zoneName: string | null;
	zoneActive: boolean;
}

export interface ZoneCheckResult {
	status: CheckStatus;
	details: ZoneDetails | null;
	reason?: string;
}
