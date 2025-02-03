import * as language from "../js/lang/language";
import { assert } from "chai";

describe("language", () => {
	describe("#getStrings()", () => {
		for (const lang of ["en", "de"]) {
			test("should contain the language " + lang, () => {
				assert(language.setLanguage(lang), "Language not found.");
				assert.isAbove(Object.keys(language.getIdStrings()).length, 27);
				assert.isOk(language.getString("file"), "Key 'file' not found.");
			});
		}
		test("German and English should be fully translated", () => {
			const all = language.getAll();
			// top level keys match
			assert.deepEqual(Object.keys(all.en), Object.keys(all.de), "German or English not fully translated; missing at least one section");

			const topLevelKeys = Object.keys(all.en);
			// lower level keys match
			for (const key of topLevelKeys) {
				assert.deepEqual(Object.keys(all.en[key]), Object.keys(all.de[key]), `German or English not fully translated; missing keys in section ${key}`);
			}
		});
	});
});
