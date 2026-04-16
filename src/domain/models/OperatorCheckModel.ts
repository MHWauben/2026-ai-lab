import type { CheckStatus } from '@domain/enums/CheckStatus.enum';

export interface OperatorDetails {
	operatorFound: boolean;
	operatorName: string | null;
	licenceNumber: string | null;
	licenceExpiry: string | null;
	avAuthorised: boolean;
}

export interface OperatorCheckResult {
	status: CheckStatus;
	details: OperatorDetails;
	reason?: string;
}
