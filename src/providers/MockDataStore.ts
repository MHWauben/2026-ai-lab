import type { OperatorDetails } from '@domain/models/OperatorCheckModel';
import type { RegistrationDetails } from '@domain/models/RegistrationCheckModel';
import type { ZoneDetails } from '@domain/models/ZoneCheckModel';

interface VehicleRecord {
	registration: RegistrationDetails;
	operator: OperatorDetails;
	zone: ZoneDetails;
}

export const MOCK_VEHICLES: Record<string, VehicleRecord> = {
	AV01XYZ: {
		registration: {
			make: 'Jaguar',
			model: 'I-PACE AV',
			year: 2025,
			motExpiry: '2027-03-15',
			avTypeApproval: 'UKAV-2025-0042',
			insuranceStatus: 'ACTIVE',
			insurer: 'AV Mutual Ltd',
		},
		operator: {
			operatorFound: true,
			operatorName: 'Waymo UK Ltd',
			licenceNumber: 'PHV-AV-00123',
			licenceExpiry: '2027-12-31',
			avAuthorised: true,
		},
		zone: {
			location: { lat: 51.5054, lng: -0.0235 },
			zoneName: 'Canary Wharf AV Zone',
			zoneActive: true,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.0300, 51.5020],
					[-0.0170, 51.5020],
					[-0.0170, 51.5090],
					[-0.0300, 51.5090],
					[-0.0300, 51.5020],
				]],
			},
		},
	},
	AV02ABC: {
		registration: {
			make: 'Mercedes-Benz',
			model: 'EQS AV',
			year: 2025,
			motExpiry: '2027-06-20',
			avTypeApproval: 'UKAV-2025-0087',
			insuranceStatus: 'ACTIVE',
			insurer: 'Autonomous Cover Ltd',
		},
		operator: {
			operatorFound: false,
			operatorName: null,
			licenceNumber: null,
			licenceExpiry: null,
			avAuthorised: false,
		},
		zone: {
			location: { lat: 51.5054, lng: -0.0235 },
			zoneName: 'Canary Wharf AV Zone',
			zoneActive: true,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.0300, 51.5020],
					[-0.0170, 51.5020],
					[-0.0170, 51.5090],
					[-0.0300, 51.5090],
					[-0.0300, 51.5020],
				]],
			},
		},
	},
	AV03DEF: {
		registration: {
			make: 'Tesla',
			model: 'Model S AV',
			year: 2024,
			motExpiry: '2026-11-10',
			avTypeApproval: 'UKAV-2024-0156',
			insuranceStatus: 'ACTIVE',
			insurer: 'EV Shield Insurance',
		},
		operator: {
			operatorFound: false,
			operatorName: null,
			licenceNumber: null,
			licenceExpiry: null,
			avAuthorised: false,
		},
		zone: {
			location: { lat: 51.4613, lng: -0.1156 },
			zoneName: null,
			zoneActive: false,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.1220, 51.4580],
					[-0.1090, 51.4580],
					[-0.1090, 51.4650],
					[-0.1220, 51.4650],
					[-0.1220, 51.4580],
				]],
			},
		},
	},
	AV04GHI: {
		registration: {
			make: 'Volvo',
			model: 'EX90 AV',
			year: 2024,
			motExpiry: '2025-01-15',
			avTypeApproval: 'UKAV-2024-0201',
			insuranceStatus: 'ACTIVE',
			insurer: 'Fleet Protect Ltd',
		},
		operator: {
			operatorFound: true,
			operatorName: 'Cruise London Ltd',
			licenceNumber: 'PHV-AV-00456',
			licenceExpiry: '2027-09-30',
			avAuthorised: true,
		},
		zone: {
			location: { lat: 51.5085, lng: -0.0762 },
			zoneName: 'Olympic Park AV Zone',
			zoneActive: true,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.0830, 51.5050],
					[-0.0690, 51.5050],
					[-0.0690, 51.5120],
					[-0.0830, 51.5120],
					[-0.0830, 51.5050],
				]],
			},
		},
	},
	AV05JKL: {
		registration: {
			make: 'BMW',
			model: 'iX AV',
			year: 2025,
			motExpiry: '2027-08-22',
			avTypeApproval: 'UKAV-2025-0099',
			insuranceStatus: 'ACTIVE',
			insurer: 'AV Mutual Ltd',
		},
		operator: {
			operatorFound: true,
			operatorName: 'Oxa Operations Ltd',
			licenceNumber: 'PHV-AV-00789',
			licenceExpiry: '2028-03-15',
			avAuthorised: true,
		},
		zone: {
			location: { lat: 51.5133, lng: -0.1371 },
			zoneName: null,
			zoneActive: false,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.1440, 51.5100],
					[-0.1300, 51.5100],
					[-0.1300, 51.5170],
					[-0.1440, 51.5170],
					[-0.1440, 51.5100],
				]],
			},
		},
	},
	AV06MNO: {
		registration: {
			make: 'Audi',
			model: 'e-tron AV',
			year: 2025,
			motExpiry: '2027-05-01',
			avTypeApproval: 'UKAV-2025-0112',
			insuranceStatus: 'PENDING',
			insurer: null,
		},
		operator: {
			operatorFound: true,
			operatorName: 'AutoRide UK Ltd',
			licenceNumber: 'PHV-AV-00321',
			licenceExpiry: '2026-04-23',
			avAuthorised: true,
		},
		zone: {
			location: { lat: 51.47, lng: -0.4543 },
			zoneName: 'Heathrow Airport AV Zone',
			zoneActive: true,
			polygon: {
				type: 'Polygon',
				coordinates: [[
					[-0.4620, 51.4650],
					[-0.4460, 51.4650],
					[-0.4460, 51.4750],
					[-0.4620, 51.4750],
					[-0.4620, 51.4650],
				]],
			},
		},
	},
};
