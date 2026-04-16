import { Service } from 'typedi';

@Service()
export class RegistrationProviderMock {
	findRegistration = jest.fn();
}
