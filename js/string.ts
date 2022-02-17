/** String handling helper methods.*/

/**
 * Limit the input string to the maximum length. If it is longer, it will get cut and have two dots appended to exactly achieve the maximum length.
 * @param  s              potentially long input string to shorten
 * @param maxLength maximum output string length
 * @returns                the abbreviated input string
 */
export function abbrv(s: string, maxLength: number = 25) {
	if (s.length < maxLength) {
		return s;
	}
	return s.substring(0, maxLength - 2) + "..";
}
