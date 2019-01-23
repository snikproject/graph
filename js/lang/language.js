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
  if(!strings[lang]) {return false;}
  language=lang;
  return true;
}

/**
@returns {string} the active language code, such as "en" or "de"
*/
export function getLanguage() {return language;}

/**
 * getString - description
 * @return {type}  descriptioa
 */
export function getString(key)
{
  const ss = strings[language];
  if(!ss.all) {ss.all={...ss.idStrings,...ss.messageStrings};}
  {return ss.all[key];}
}

/**
 * getString - description
 * @return {type}  description
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
