import { Service } from 'typedi';

@Service()
export class OperatorProviderMock {
	findOperator = jest.fn();
}
