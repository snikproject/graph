/**
Language dependend strings.
@module */

import en from './en.js';
import de from './de.js';

const strings =
{
  'en': en,
  'de': de,
};

let language = "en";

/** Sets the user interface language. */
export function setLanguage(lang)
{
  if(!strings[lang]) {throw "Language "+lang+" not found.";}
  language=lang;
}

/**
 * getString - description
 * @return {type}  description
 */
export function getString(key)
{
  return strings[language][key];
}

/**
 * getString - description
 * @return {type}  description
 */
export function getStrings()
{
  return strings[language];
}
