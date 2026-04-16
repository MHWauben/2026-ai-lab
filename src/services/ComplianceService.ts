import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import type { ComplianceReport } from '@domain/models/ComplianceReportModel';
import { OperatorService } from '@services/OperatorService';
import { RegistrationService } from '@services/RegistrationService';
import { ZoneService } from '@services/ZoneService';
import { Inject, Service } from 'typedi';

@Service()
export class ComplianceService {
	constructor(
		@Inject() private readonly registrationService: RegistrationService,
		@Inject() private readonly operatorService: OperatorService,
		@Inject() private readonly zoneService: ZoneService
	) {}

	async checkCompliance(plate: string): Promise<ComplianceReport> {
		const [registration, operator, zone] = await Promise.all([
			this.registrationService.checkRegistration(plate),
			this.operatorService.checkOperator(plate),
			this.zoneService.checkZone(plate),
		]);

		const statuses = [registration.status, operator.status, zone.status];
		const overallStatus = this.computeOverallStatus(statuses);

		if (overallStatus === CheckStatus.UNKNOWN) {
			return {
				plate: this.formatPlate(plate),
				checkedAt: new Date().toISOString(),
				overallStatus,
				message: 'Vehicle not found in any register',
			};
		}

		return {
			plate: this.formatPlate(plate),
			checkedAt: new Date().toISOString(),
			overallStatus,
			checks: { registration, operator, zone },
		};
	}

	private computeOverallStatus(statuses: CheckStatus[]): CheckStatus {
		if (statuses.every((s) => s === CheckStatus.UNKNOWN)) {
			return CheckStatus.UNKNOWN;
		}
		if (statuses.some((s) => s === CheckStatus.FAIL)) {
			return CheckStatus.FAIL;
		}
		if (statuses.some((s) => s === CheckStatus.NEEDS_REVIEW)) {
			return CheckStatus.NEEDS_REVIEW;
		}
		return CheckStatus.PASS;
	}

	private formatPlate(plate: string): string {
		const normalised = plate.toUpperCase().replace(/\s/g, '');
		if (normalised.length === 7) {
			return `${normalised.slice(0, 4)} ${normalised.slice(4)}`;
		}
		return normalised;
	}
}
