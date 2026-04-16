import { Service } from 'typedi';

@Service()
export class RegistrationServiceMock {
	checkRegistration = jest.fn();
}
