import type { Container as ContainerType } from 'typedi';

export class TypeDIMock {
	static container = new Map<unknown, unknown>();

	static factory = {
		...jest.requireActual('typedi'),
		Container: {
			get: (key: string) => TypeDIMock.container.get(key),
			set: (type: string, value: unknown) => {
				TypeDIMock.container.set(type, value);
			},
		} satisfies ContainerType,
	};

	static session: {
		selectList: jest.Mock<Promise<unknown[]>>;
		selectOne: jest.Mock<Promise<unknown | undefined>>;
	} = {
		selectList: jest.fn(),
		selectOne: jest.fn(),
	};
}
