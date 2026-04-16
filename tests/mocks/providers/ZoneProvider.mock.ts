import { Service } from 'typedi';

@Service()
export class ZoneProviderMock {
	checkZone = jest.fn();
}
