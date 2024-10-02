/** Generates the HTML user manual using the help data describing the menu and context menu. */
import fs from "fs";
import { help } from "../js/help.ts";
import * as language from "../js/lang/language.ts";
// provide the log global to language.js, only show warnings and errors
global.log = { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };

String.prototype.capitalize = function () {
	return this.replace(/(?:^|\s)\S/g, function (a) {
		return a.toUpperCase();
	});
};

let counter = 0;

/** Recursively traverse the help data and transform it to HTML.*/
function traverse(o, depth = 1) {
	let html = "";
	const label = (key) =>
		(language.getString(key)
			? language.getString(key) // prefer the localized description string
			: key.replace("-", " ")
		) // generate label out of key as fallback
			.capitalize();
	const heading = (key) => `<h${depth}>${label(key)}</h${depth}>\n`;
	for (const key in o) {
		counter++;
		const value = o[key];
		if (typeof value !== "string") {
			// value is an object
			html += heading(key);
			{
				html += traverse(value, depth + 1);
			}
			continue;
		}
		// value is a string
		if (key === "img") {
			html += `<center><img src="img/${value}" class="helpimage"></center>\n`;
			continue;
		}
		if (key !== "") {
			html += heading(key);
		}
		html += value + "\n";
	}
	return html;
}

/** Fill the HTML template and write the result to the manual. */
function generateManual() {
	language.setLanguage("en");
	const html = traverse(help);
	console.log("Generating " + counter + " help entries");
	fs.readFile("node/manual.html.template", "utf8", (err, data) => {
		if (err) {
			throw err;
		}
		{
			fs.writeFile("html/manual.html", data.replace("#CONTENT#", html), (err2) => {
				if (err2) {
					throw err2;
				}
			});
		}
	});
}

generateManual();
