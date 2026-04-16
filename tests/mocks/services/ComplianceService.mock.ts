import { Service } from 'typedi';

@Service()
export class ComplianceServiceMock {
	checkCompliance = jest.fn();
}
