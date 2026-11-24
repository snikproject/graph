import { search, createIndex } from "../js/fuseSearch";

const ns = (sub: string, id: string): string => `http://www.snik.eu/ontology/${sub}/${id}`;

/** Queries and the classes that must be among the results, in any order and with any number of additional hits. */
const SEARCH: Record<string, Array<string>> = {
	CEO: [ns("ciox", "ChiefExecutiveOfficer"), ns("bb", "ChiefExecutiveOfficer"), ns("he", "ChiefExecutiveOfficer")],
	// multi-word query, the words appear in this order in the labels
	"hospital information system": [ns("bb", "HospitalInformationSystem"), ns("ob", "HospitalInformationSystem")],
	// multi-word query where no label contains all words adjacently in this order
	"system information": [ns("bb", "ComputerBasedInformationSystem")],
	// misspelled query, matched fuzzily against the labels
	architecure: [ns("bb", "MonolithicArchitecture"), ns("bb", "BestOfBreedArchitecture")],
	// queries from the release checklist
	"logical tool layer": [ns("bb", "LogicalToolLayer"), ns("ob", "LogicalToolLayer")],
	// German label of a class whose English label does not contain the word
	krankenhausinformationssystem: [ns("bb", "HospitalInformationSystem"), ns("ob", "HospitalInformationSystem")],
	// only contained in the skos:definition, so this fails if definitions stop being indexed
	lerneinheit: [ns("he", "IstzustandErheben")],
};

/** Queries whose complete result set is fixed. They fail if the search becomes sloppier, e.g. by matching single tokens. */
const EXACT: Record<string, Array<string>> = { "3lgm2 mentity type": [ns("bb", "3LGM2EntityType")], zzzz: [] };

describe("fuse#search", () => {
	createIndex();
	test("finds the expected classes", async () => {
		for (const query in SEARCH) {
			const uris = (await search(query)).map((x) => x.item.uri);
			expect(uris).toEqual(expect.arrayContaining(SEARCH[query]));
		}
	}, 20000);
	test("returns exactly the expected classes", async () => {
		for (const query in EXACT) {
			const uris = (await search(query)).map((x) => x.item.uri);
			expect(uris).toEqual(EXACT[query]);
		}
	}, 20000);
});
