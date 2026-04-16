import { Service } from 'typedi';

@Service()
export class OperatorServiceMock {
	checkOperator = jest.fn();
}
