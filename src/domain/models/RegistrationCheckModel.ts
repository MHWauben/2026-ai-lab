import type { CheckStatus } from '@domain/enums/CheckStatus.enum';

export interface RegistrationDetails {
	make: string;
	model: string;
	year: number;
	motExpiry: string;
	avTypeApproval: string | null;
	insuranceStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'NONE';
	insurer: string | null;
}

export interface RegistrationCheckResult {
	status: CheckStatus;
	details: RegistrationDetails | null;
	reason?: string;
}
