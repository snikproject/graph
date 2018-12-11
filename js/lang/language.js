/**
Language dependend strings.
@module */

import en from './en.js';

const strings =
{
  'en': en,
};

let language = "en";

/** Sets the user interface language. */
export function setLanguage(lang)
{
  if(!strings.lang) {throw "Language "+lang+" not found.";}
  language=lang;
}

/**
 * getString - description
 * @return {type}  description
 */
function getString()
{

}
