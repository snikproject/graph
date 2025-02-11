/**
 * Converts a color from hsv to a hex rgb value.
 * @param hue - The hue in the range of 0 to 1.
 * @param saturation - The saturation in the range 0 to 1.
 * @param value - The value int the range 0 to 1.
 * @returns an rgb hex color prefixed with '#'.
 */
export function hsvToHexColor(hue: number, saturation: number, value: number): string {
	const hDash = Math.floor(hue * 6);
	const f = hue * 6 - hDash;
	const p = value * (1 - saturation);
	const q = value * (1 - f * saturation);
	const t = value * (1 - (1 - f) * saturation);
	let r: number, g: number, b: number;
	switch (hDash % 6) {
		case 0:
			(r = value), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = value), (b = p);
			break;
		case 2:
			(r = p), (g = value), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = value);
			break;
		case 4:
			(r = t), (g = p), (b = value);
			break;
		case 5:
			(r = value), (g = p), (b = q);
			break;
	}
	return (
		"#" +
		("00" + Math.floor(r * 255).toString(16)).slice(-2) + // .substr() is deprecated on some browser
		("00" + Math.floor(g * 255).toString(16)).slice(-2) +
		("00" + Math.floor(b * 255).toString(16)).slice(-2)
	);
}

/**
 * Converts a string to a color depending on the hash value of the string.
 * So we get pseudo-randomized colors for different strings.
 * @param str - The string to get a color for.
 * @returns A # leaded rgb hex color depending on the input string.
 */
export function stringToColor(str: string): string {
	let hash = 0;
	// generate hash
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	// normalize
	hash = (hash % 180) / 360.0; // keep resolution
	hash += 0.5; // note % resolves also to negative values, so we use one half from negative and the other from the positive
	return hsvToHexColor(hash, 1, 1);
}
