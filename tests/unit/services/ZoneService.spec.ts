import { CheckStatus } from '@domain/enums/CheckStatus.enum';
import { ZoneProvider } from '@providers/ZoneProvider';
import { ZoneService } from '@services/ZoneService';
import { Container } from 'typedi';
import { ZoneProviderMock } from '@/tests/mocks/providers/ZoneProvider.mock';

jest.mock('@providers/ZoneProvider');

describe('ZoneService', () => {
	let service: ZoneService;
	let mockProvider: jest.Mocked<ZoneProvider>;

	beforeEach(() => {
		Container.set(ZoneProvider, new ZoneProviderMock());
		mockProvider = Container.get(ZoneProvider) as jest.Mocked<ZoneProvider>;
		service = new ZoneService(mockProvider);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return UNKNOWN when vehicle not found', async () => {
		mockProvider.checkZone.mockResolvedValue(null);

		const result = await service.checkZone('XX99ZZZ');

		expect(result.status).toBe(CheckStatus.UNKNOWN);
		expect(result.details).toBeNull();
	});

	it('should return PASS when vehicle is in an active zone', async () => {
		mockProvider.checkZone.mockResolvedValue({
			location: { lat: 51.5054, lng: -0.0235 },
			zoneName: 'Canary Wharf AV Zone',
			zoneActive: true,
		});

		const result = await service.checkZone('AV01XYZ');

		expect(result.status).toBe(CheckStatus.PASS);
		expect(result.details?.zoneName).toBe('Canary Wharf AV Zone');
	});

	it('should return FAIL when vehicle is not in a designated zone', async () => {
		mockProvider.checkZone.mockResolvedValue({
			location: { lat: 51.4613, lng: -0.1156 },
			zoneName: null,
			zoneActive: false,
		});

		const result = await service.checkZone('AV03DEF');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('not in a designated');
	});

	it('should return FAIL when zone exists but is not active', async () => {
		mockProvider.checkZone.mockResolvedValue({
			location: { lat: 51.5054, lng: -0.0235 },
			zoneName: 'Canary Wharf AV Zone',
			zoneActive: false,
		});

		const result = await service.checkZone('TEST');

		expect(result.status).toBe(CheckStatus.FAIL);
		expect(result.reason).toContain('not currently active');
	});
});
