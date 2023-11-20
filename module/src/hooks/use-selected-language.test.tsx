/**
 * @jest-environment jsdom
 */
import { cleanup, renderHook } from '@testing-library/react';
import useSelectedLanguage from './use-selected-language';
import { ReadonlyURLSearchParams } from 'next/navigation';



jest.mock('./../../../i18n/index', () => {
	return {
		__esModule: true,
		i18n: {
			translations: { mock: { title: 'mock' }, foo: { title: 'bar' } },
			defaultLang: 'mock',
		},
	};
});

jest.mock('next/navigation', () => ({
	useSearchParams() {
		return new URLSearchParams();
	},
}));

const useSearchParams = jest.spyOn(require('next/navigation'), 'useSearchParams');

beforeEach(() => {});

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
});

describe('The hook returns ', () => {
	it(`the default language if there is no searchParams object  `, async () => {
		useSearchParams.mockImplementation(() => new URLSearchParams());

		const { result } = renderHook(() => useSelectedLanguage());
		expect(result.current.lang).toBe('mock');
	});

	it(`the language from the searchParams query object  `, async () => {
		useSearchParams.mockImplementation(() => new URLSearchParams('lang=foo'));
		const { result } = renderHook(() => useSelectedLanguage());
		expect(result.current.lang).toBe('foo');
	});

	it(`the updated language if the searchParams query object changes`, async () => {
		useSearchParams.mockImplementation(() => new URLSearchParams('lang=foo'));
		const { result: firstResult } = renderHook(() => useSelectedLanguage());
		expect(firstResult.current.lang).toBe('foo');

		useSearchParams.mockImplementation(() => new URLSearchParams('lang=bar'));
		const { result } = renderHook(() => useSelectedLanguage());
		expect(result.current.lang).toBe('mock');
	});
});
