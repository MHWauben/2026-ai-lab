import { Service } from 'typedi';

@Service()
export class ReportServiceMock {
	submitReport = jest.fn();
}
