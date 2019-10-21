/**
Language dependend strings.
@module */

import en from './en.js';
import de from './de.js';

const strings =
{
  'en': en,
  'de': de,
  'fa': {idStrings: {}, messageStrings: {}}, // for future Persian UI labels and for Persian class labels
};

let language = "en";

/** Sets the user interface language if it exists.
@returns {boolean} whether the language exists
*/
export function setLanguage(lang)
{
  log.debug(`Set language from ${language} to ${lang}.`);
  if(!strings[lang])
  {
    log.warn(`Language ${lang} not found. Keeping language ${language}.`);
    return false;
  }
  language=lang;
  return true;
}

/**
@returns {string} the active language code, such as "en" or "de"
*/
export function getLanguage() {return language;}

/**
 * @param {string} key
 * @return {string} description
 */
export function getString(key)
{
  const ss = strings[language];
  if(!ss.all) {ss.all={...ss.idStrings,...ss.messageStrings};}
  {return ss.all[key];}
}

/**
 * returns the id strings for the active language
 * @return {string}  description
 */
export function getIdStrings()
{
  return strings[language].idStrings;
}

/* These strings have a fixed language because they are intended for the developers. */
export const CONSTANTS =
{
  SPARUL_WARNING: 'Please be careful with all SPARUL operations and always create a <a href="https://wiki.imise.uni-leipzig.de/Projekte/SNIK/ontologie/sparql">SPARQL dump</a> as a backup beforehand.',
};

/** Update all HTML elements with data-i18n tags. */
export function updateHtml()
{
  for(const key of Object.keys(strings[language]))
  {
    const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
    if(elements.length===0)
    {
      log.warn(`i18n key ${key} not used`);
      continue;
    }
    for(const element of elements)
    {
      const s = strings[language][key];
      switch(element.tagName)
      {
        case "A":
        case "BUTTON":
        case "SPAN": element.textContent = s; break;
        default: log.warn(`Cannot assign text "${s}" to element with i18n key ${key} because its tag type ${element.tagName} is unsupported.`);
      }
    }
  }
}
