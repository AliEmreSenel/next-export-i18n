Object.defineProperty(exports, '__esModule', { value: true });

var navigation = require('next/navigation');
var react = require('react');
var I18N = require('./../../i18n/index.js');
var router = require('next/router');
var Mustache = require('mustache');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Mustache__default = /*#__PURE__*/_interopDefaultLegacy(Mustache);

/**
 * The entry files for the separated hooks
 */
/**
 * Calculates the default language from the user's language setting and the i18n object.
 * In case there is a language set in the browser which is also available as translation,
 * override the default language setting in the config file.
 * @returns string indicating the default language to use
 */
const getDefaultLanguage = (userI18n) => {
    let browserLang = "";
    if (userI18n.useBrowserDefault &&
        typeof window !== "undefined" &&
        window &&
        window.navigator &&
        (window.navigator.languages || window.navigator.language)) {
        browserLang = ((window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language)
            .split("-")[0]
            .toLowerCase();
    }
    if (userI18n.useBrowserDefault &&
        browserLang &&
        userI18n.translations[browserLang]) {
        return browserLang;
    }
    return userI18n.defaultLang;
};
/**
 * Imports the translations addes by the user in "i18n/index",
 * veryfies the tranlsations and exposes them
 * to the custom hooks
 * @returns the translations and the default language as defined in "i18n/index"
 */
const i18n = () => {
    // cast to be typsafe
    const userI18n = I18N;
    if (Object.keys(userI18n.translations).length < 1) {
        throw new Error(`Missing translations. Did you import and add the tranlations in 'i18n/index.js'?`);
    }
    if (userI18n.defaultLang.length === 0) {
        throw new Error(`Missing default language. Did you set 'defaultLang' in 'i18n/index.js'?`);
    }
    if (!userI18n.translations[userI18n.defaultLang]) {
        throw new Error(`Invalid default language '${userI18n.defaultLang}'. Check your 'defaultLang' in 'i18n/index.js'?`);
    }
    userI18n.defaultLang = getDefaultLanguage(userI18n);
    return userI18n;
};

/**
 * Returns a react-state containing the currently selected language.
 * @returns [lang as string, setLang as SetStateAction] a react-state containing the currently selected language
 */
function useSelectedLanguage() {
    let i18nObj;
    i18nObj = i18n();
    const defaultLang = i18nObj.defaultLang;
    const translations = i18nObj.translations;
    const searchParams = navigation.useSearchParams();
    const [lang, setLang] = react.useState(defaultLang);
    // set the language if the query parameter changes
    react.useEffect(() => {
        if (searchParams && searchParams.get("lang") && searchParams.get("lang") !== lang && translations && translations[searchParams.get("lang")]) {
            let lang = searchParams.get("lang");
            setLang(lang);
        }
    }, [lang, searchParams]);
    return { lang, setLang };
    // return [lang, setLang] as const;
}

let passedQuery;
/**
 * Returns a react-state which is a queryObject containing an exsisting query and a query string with the current selected
 * language (or the passed forced language).
 * Reason: We want to preserve an existing query string.
 * Usage: LanguageSwitcher with forceLang param and all links without forceLang param
  * @param [forceLang] string to override the selected language
 * @returns queryObject react-state as ParsedUrlQueryInput
 */
function useLanguageQuery(forceLang) {
    const { lang } = useSelectedLanguage();
    const searchParams = navigation.useSearchParams();
    const [value, setValue] = react.useState();
    // keep passed parameters
    passedQuery = {};
    if (searchParams) {
        searchParams.forEach((value, key) => {
            passedQuery[key] = value;
        });
    }
    // set lang if one of the dependencies is changing
    react.useEffect(() => {
        setValue({
            ...passedQuery,
            lang: forceLang || lang || passedQuery['lang'],
        });
    }, [forceLang, lang]);
    return [value];
}

/**
 * Returns a boolean react-state indicating if the current selected language equals the one passed to the hook.
 * @param currentLang string the language to check. Needs to equal the key in i18n/index.
 * @returns boolean react-state
 */
function useLanguageSwitcherIsActive(currentLang) {
    let i18nObj;
    i18nObj = i18n();
    const defaultLang = i18nObj.defaultLang;
    const router$1 = router.useRouter();
    const [isActive, setIsActive] = react.useState(false);
    react.useEffect(() => {
        let current = false;
        if (!router$1.query || !router$1.query.lang) {
            current = defaultLang === currentLang;
        }
        else {
            current = router$1.query.lang === currentLang;
        }
        setIsActive(current);
    }, [currentLang, defaultLang, router$1.query]);
    return { isActive };
    // return [isActive] as const;
}

/**
 * Provides the t() function which returns the value stored for this given key (e.g. "i18n.ui.headline")
 * in the translation file.
 * The return value can be a string, a number, an array or an object.
 * In case there is no entry for this key, it returns the key.
 * @returns t(key: string): any function
 */
const useTranslation = () => {
    let i18nObj;
    i18nObj = i18n();
    const translations = i18nObj.translations;
    i18nObj.defaultLang;
    const { lang } = useSelectedLanguage();
    // const [lang] = useSelectedLanguage();
    return {
        /**
         * Returns the value stored for this given key (e.g. "i18n.ui.headline")  in the translation file.
         * The return value can be a string, a number, an array or an object.
         * In case there is no entry for this key, it returns the key.
         * @param key the key for looking up the translation
         * @param view the mustache view for interpolating the template string
         * @returns the value stored for this key, could be a string, a number, an array or an object
         */
        t: (key, view) => {
            let value = key.split('.').reduce((previous, current) => (previous && previous[current]) || null, translations[lang]);
            let translation = value || key;
            try {
                return Mustache__default["default"].render(translation, view);
            }
            catch (e) {
                return translation;
            }
        },
    };
};

exports["default"] = i18n;
exports.useLanguageQuery = useLanguageQuery;
exports.useLanguageSwitcherIsActive = useLanguageSwitcherIsActive;
exports.useSelectedLanguage = useSelectedLanguage;
exports.useTranslation = useTranslation;
