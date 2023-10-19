import "isomorphic-fetch";
import { search, createIndex } from "../js/fuseSearch";
console.groupCollapsed;

const SEARCH = {
	CEO: [
		"http://www.snik.eu/ontology/ciox/ChiefExecutiveOfficer",
		"http://www.snik.eu/ontology/bb/ChiefExecutiveOfficer",
		"http://www.snik.eu/ontology/he/ChiefExecutiveOfficer",
	],
	"3lgm2 mentity type": ["http://www.snik.eu/ontology/bb/3LGM2EntityType"],
};

describe("fuse#search", () => {
	createIndex();
	test("correct search results", async () => {
		for (const key in SEARCH) {
			const uris = (await search(key)).map((x) => x.item.uri);
			const expectedUris = SEARCH[key];
			if (expectedUris.length === 1) {
				expect(uris).toEqual(expectedUris);
			} else {
				expect(uris).toEqual(expect.arrayContaining(expectedUris));
			}
		}
	});
});
