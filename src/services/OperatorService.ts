import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { OperatorCheckResult } from '@domain/models/OperatorCheckModel';
import { OperatorProvider } from '@providers/OperatorProvider';
import { Inject, Service } from 'typedi';

const EXPIRY_WARNING_DAYS = 30;

@Service()
export class OperatorService {
	constructor(@Inject() private readonly operatorProvider: OperatorProvider) {}

	async checkOperator(plate: string): Promise<OperatorCheckResult> {
		const details = await this.operatorProvider.findOperator(plate);

		if (!details) {
			return {
				status: CheckStatus.UNKNOWN,
				details: {
					operatorFound: false,
					operatorName: null,
					licenceNumber: null,
					licenceExpiry: null,
					avAuthorised: false,
				},
				reason: 'Vehicle not found in register',
			};
		}

		if (!details.operatorFound) {
			return { status: CheckStatus.FAIL, details, reason: 'No private hire operator is linked to this vehicle' };
		}

		if (!details.avAuthorised) {
			return {
				status: CheckStatus.FAIL,
				details,
				reason: 'Operator is not authorised for autonomous vehicle operations',
			};
		}

		if (details.licenceExpiry) {
			const expiryDate = new Date(details.licenceExpiry);
			const now = new Date();
			const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

			if (daysUntilExpiry < 0) {
				return { status: CheckStatus.FAIL, details, reason: 'Operator licence has expired' };
			}

			if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
				return {
					status: CheckStatus.NEEDS_REVIEW,
					details,
					reason: `Operator licence expiring in ${daysUntilExpiry} days`,
				};
			}
		}

		return { status: CheckStatus.PASS, details };
	}
}
