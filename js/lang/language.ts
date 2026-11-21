/** Language dependend strings.*/

import { en } from "./en";
import { de } from "./de";
import log from "loglevel";

/** All translations of a single language. */
interface LanguageStrings {
	idStrings: Record<string, string>;
	messageStrings: Record<string, string>;
	contextMenuStrings?: Record<string, string>;
	/** Lazily created union of all string categories. */
	all?: Record<string, string>;
}

const strings: Record<string, LanguageStrings> = {
	en: en,
	de: de,
	fa: { idStrings: {}, messageStrings: {} }, // for future Persian UI labels and for Persian class labels
};

let language = "en";

/** Sets the user interface language if it exists.
@param lang - the language tag that the user interface should switch to
@returns whether the language exists
*/
export function setLanguage(lang: string): boolean {
	log.debug(`Set language from ${language} to ${lang}.`);
	if (!strings[lang]) {
		log.warn(`Language ${lang} not found. Keeping language ${language}.`);
		return false;
	}
	language = lang;
	// keep assistive technology informed about the interface language, guard for non-browser environments like tests
	if (typeof document !== "undefined") {
		document.documentElement.lang = lang;
	}
	return true;
}

/**
@returns the active language code, such as "en" or "de"
*/
export function getLanguage(): string {
	return language;
}

/** Returns the lazily created union of all string categories of a language.
 * @param ss - the strings of a single language
 * @returns all strings of that language by key */
function allStrings(ss: LanguageStrings): Record<string, string> {
	if (!ss.all) {
		ss.all = { ...ss.idStrings, ...ss.messageStrings, ...ss.contextMenuStrings };
	}
	return ss.all;
}

/**
 * @param key - language independent key
 * @param hotkey - optional key combination to be displayed next to this string
 * @returns language dependend string
 */
export function getString(key: string, hotkey?: string): string {
	let s = allStrings(strings[language])[key];
	if (!s) {
		// Fall back to English so that partially translated languages show readable text instead of internal keys.
		s = allStrings(strings.en)[key];
		if (s) {
			log.debug(`Internationalization string ${key} not found for language ${language}, using English.`);
		}
	}
	if (!s) {
		log.error("Internationalization string not found for key " + key);
		return key;
	}
	return s + (hotkey ? ` (${hotkey.toUpperCase()})` : "");
}

/**
 * returns the id strings for the active language
 * @returns map of i18n keys to the localized strings of HTML elements
 */
export function getIdStrings(): Record<string, string> {
	// Include the English keys so that updateHtml() also updates elements of partially translated languages.
	return { ...strings.en.idStrings, ...strings[language].idStrings };
}

// return everything
export function getAll() {
	return strings;
}

/* These strings have a fixed language because they are intended for the developers. */
export const CONSTANTS = {
	SPARUL_WARNING:
		'Please be careful with all SPARUL operations and always create a <a href="https://wiki.imise.uni-leipzig.de/Projekte/SNIK/ontologie/sparql">SPARQL dump</a> as a backup beforehand.',
};

/** Update all HTML elements with data-i18n tags. */
export function updateHtml(): void {
	const idstrings = getIdStrings();
	const unused: string[] = [];
	for (const key of Object.keys(idstrings)) {
		const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
		if (elements.length === 0) {
			unused.push(key);
			continue;
		}
		for (const element of elements) {
			const s = getString(key, element.getAttribute("hotkey"));
			switch (element.tagName) {
				case "A":
				case "BUTTON":
				case "DIV":
				case "LABEL":
				case "SPAN":
					element.textContent = s;
					break;
				case "INPUT":
					(element as HTMLInputElement).value = s;
					break;
				default:
					log.warn(`Cannot assign text "${s}" to element with i18n key ${key} because its tag type ${element.tagName} is unsupported.`);
			}
		}
	}
	if (unused.length > 0) {
		log.debug(`UpdateHtml: i18n keys ${unused.toString()} not used`);
	}
}
