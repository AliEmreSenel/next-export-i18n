import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import i18n from './../index';
import { I18N } from '../types';

/**
 * Returns a react-state containing the currently selected language.
 * @returns [lang as string, setLang as SetStateAction] a react-state containing the currently selected language
 */
export default function useSelectedLanguage() {
	let i18nObj: I18N;

	i18nObj = i18n() as I18N;

	const defaultLang: string = i18nObj.defaultLang;
	const translations = i18nObj.translations;
	const searchParams = useSearchParams();
	const [lang, setLang] = useState<string>(defaultLang);

	// set the language if the query parameter changes
	useEffect(() => {
		if (searchParams && searchParams.get("lang") && searchParams.get("lang") !== lang && translations && translations[searchParams.get("lang") as string]) {
			let lang: string = searchParams.get("lang") as string;
			setLang(lang);
		}

	}, [lang, searchParams]);
	return { lang, setLang } as const;
	// return [lang, setLang] as const;
}
