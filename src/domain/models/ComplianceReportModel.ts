import type { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { OperatorCheckResult } from '@domain/models/OperatorCheckModel';
import type { RegistrationCheckResult } from '@domain/models/RegistrationCheckModel';
import type { ZoneCheckResult } from '@domain/models/ZoneCheckModel';

export interface ComplianceReport {
	plate: string;
	checkedAt: string;
	overallStatus: CheckStatus;
	message?: string;
	checks?: {
		registration: RegistrationCheckResult;
		operator: OperatorCheckResult;
		zone: ZoneCheckResult;
	};
}
