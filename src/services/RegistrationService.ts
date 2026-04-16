import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { RegistrationCheckResult } from '@domain/models/RegistrationCheckModel';
import { RegistrationProvider } from '@providers/RegistrationProvider';
import { Inject, Service } from 'typedi';

@Service()
export class RegistrationService {
	constructor(@Inject() private readonly registrationProvider: RegistrationProvider) {}

	async checkRegistration(plate: string): Promise<RegistrationCheckResult> {
		const details = await this.registrationProvider.findRegistration(plate);

		if (!details) {
			return { status: CheckStatus.UNKNOWN, details: null, reason: 'Vehicle not found in register' };
		}

		if (details.insuranceStatus === 'PENDING') {
			return { status: CheckStatus.NEEDS_REVIEW, details, reason: 'AV insurance pending verification' };
		}

		const motExpired = new Date(details.motExpiry) < new Date();
		if (motExpired) {
			return { status: CheckStatus.FAIL, details, reason: 'MOT has expired' };
		}

		if (details.insuranceStatus !== 'ACTIVE') {
			return { status: CheckStatus.FAIL, details, reason: `Insurance status: ${details.insuranceStatus}` };
		}

		if (!details.avTypeApproval) {
			return { status: CheckStatus.FAIL, details, reason: 'No AV type approval on record' };
		}

		return { status: CheckStatus.PASS, details };
	}
}
