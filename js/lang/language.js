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
