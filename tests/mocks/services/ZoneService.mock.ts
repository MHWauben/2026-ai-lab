import { Service } from 'typedi';

@Service()
export class ZoneServiceMock {
	checkZone = jest.fn();
}
