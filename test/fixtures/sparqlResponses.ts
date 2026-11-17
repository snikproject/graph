/** Hand-written, compact SPARQL JSON responses so that the tests run without network access. */
export interface Term {
	type: "uri" | "literal";
	value: string;
}

export interface SparqlResponse {
	head: { vars: string[] };
	results: { bindings: Array<Record<string, Term>> };
}

/** @param vars - variable names of the query result
 * @param rows - one value per variable in the order of vars, trailing values may be omitted when the variable is unbound
 * @param uriVars - the subset of vars whose values are URIs instead of literals
 * @returns a response in the SPARQL JSON results format */
const response = (vars: string[], rows: string[][], uriVars: string[]): SparqlResponse => ({
	head: { vars },
	results: {
		bindings: rows.map((row) => Object.fromEntries(row.map((value, i) => [vars[i], { type: uriVars.includes(vars[i]) ? "uri" : "literal", value }]))),
	},
});

/** Recorded response for graph-classes.json, reduced to the values the tests need. */
export const graphClasses: SparqlResponse = response(
	["c", "l", "st", "src", "inst"],
	[
		["http://www.snik.eu/ontology/bb/199993EG", "1999/93/EG@en|1999/93/EG@fa", "http://www.snik.eu/ontology/meta/EntityType", "http://www.snik.eu/ontology/bb"],
		[
			"http://www.snik.eu/ontology/bb/1TierArchitecture",
			"1-tier Architecture@en|معماری سطح 1@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2PhaseCommitProtocol",
			"2-Phase-Commit-Protocol@en|پروتکل دو مرحله ای@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2TierArchitecture",
			"2-tier Architecture@en|معماری 2 لایه@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		["http://www.snik.eu/ontology/bb/3LGM2", "3LGMA2@fa|3LGM²@en", "http://www.snik.eu/ontology/meta/EntityType", "http://www.snik.eu/ontology/bb"],
		[
			"http://www.snik.eu/ontology/bb/3LGM2ApplicationComponent",
			"3LGM² Application Component@en|اجزای برنامه 3LGM2@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		["http://www.snik.eu/ontology/bb/3LGM2B", "3LGMA2-B@fa|3LGM²-B@en", "http://www.snik.eu/ontology/meta/EntityType", "http://www.snik.eu/ontology/bb"],
		[
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationInterface",
			"3LGM² Communication Interface@en|رابط ارتباطی3LGM²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationLink",
			"3LGM² Communication Link@en|لینک ارتباط 3LGM ²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2DomainLayer",
			"3LGM² Domain Layer@en|Fachliche Ebene@de|لایه دامنه 3LGM²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2EnterpriseFunction",
			"3LGM² Enterprise Function@en|تابع سازمانی 3LGM2@fa",
			"http://www.snik.eu/ontology/meta/Function",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2EntityType",
			"3LGM² Entity Type@en|نوع عنصر 3LGM ²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2InterlayerRelationship",
			"3LGM² Interlayer Relationship@en|3LGM²-Interebenenbeziehung@de|رابطه میان لایه 3LGM ² @fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2IntralayerRelationship",
			"3LGM² Intralayer Relationship@en|رابطه  میان لایه 3LGM ²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2LogicalToolLayer",
			"3LGM² Logical Tool Layer@en|Logische Werkzeugebene@de|لایه ابزار منطقی 3LGM²@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2PhysicalToolLayer",
			"3LGM² Physical Tool Layer@en|Physische Werkzeugebene@de|لایه ابزار فیزیکی 3LGM2@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/ApplicationServer",
			"Application Server@en|سروربرنامه @fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/ArchitecturalStyleOfThePhysicalToolLayer",
			"Architectural Style of The Physical Tool Layer@en|سبک معماری لایه ابزار فیزیکی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/CommunicationProtocol",
			"Communication Protocol@en|پروتکل ارتباطی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/DatabaseServer",
			"Database Server@en|سرور بانک اطلاعاتی@fa|سرور پایگاه داده@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/DocumentArchivingSystem",
			"Archivierungssystem@de|Document Archiving System@en|سیستم بایگانی سند@fa",
			"http://www.snik.eu/ontology/meta/ApplicationComponent",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/FunctionalMetamodel",
			"Functional Metamodel@en|متامدل عملکردی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/InformationManagementGuideline",
			"Information Management Guideline@en|دستورالعمل مدیریت اطلاعات@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/InformationSystemMetamodel",
			"Information System Metamodel@en|متا مدل سیستم اطلاعات@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/OrganizationalMetamodel",
			"Organizational Metamodel@en|متامودال سازمانی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/QualifiedElectronicSignature",
			"Qualified Electronic Signature@en|امضا الکترونیکی واجد شرایط@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/TechnicalMetamodel",
			"Technical Metamodel@en|متا مدل فنی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/TransactionManagementTechnology",
			"Transaction Management Technology@en|فناوری مدیریت تراکنش@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/UmlClassDiagram",
			"UML Class Diagram@en|نمودار کلاس UML@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/MixedDB1DBnStyle",
			"Mixed DB1-DBn Style@en|ترکیب روش DB1-DBn@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/ApplicationComponent",
			"Anwendungsbaustein@de|Application Component@en|عنصر نرم افزار@fa",
			"http://www.snik.eu/ontology/meta/ApplicationComponent",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/SoftwareQuality",
			"Software Quality@en|Software-Qualität@de|کیفیت نرم افزار@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/SoftwareErgonomics",
			"Software Ergonomics@en|Software-Ergonomie@de|نرم افزار ارگونومی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/SemanticIntegration",
			"Semantic Integration@en|Semantische Integration@de|ادغام معنایی@fa",
			"http://www.snik.eu/ontology/meta/EntityType",
			"http://www.snik.eu/ontology/bb",
		],
	],
	["c", "st", "src", "inst"]
);

/** Recorded response for graph-triples.json, reduced to the values the tests need. */
export const graphTriples: SparqlResponse = response(
	["c", "p", "d", "g", "ax"],
	[
		[
			"http://www.snik.eu/ontology/bb/199993EG",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/DocumentArchivingSystem",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/199993EG",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/QualifiedElectronicSignature",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/199993EG",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/InformationManagementGuideline",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/1TierArchitecture",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/ArchitecturalStyleOfThePhysicalToolLayer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2PhaseCommitProtocol",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/CommunicationProtocol",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2PhaseCommitProtocol",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/TransactionManagementTechnology",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2TierArchitecture",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/ApplicationServer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2TierArchitecture",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/DatabaseServer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/2TierArchitecture",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/ArchitecturalStyleOfThePhysicalToolLayer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/3LGM2DomainLayer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/3LGM2InterlayerRelationship",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/3LGM2IntralayerRelationship",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/3LGM2LogicalToolLayer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/entityTypeComponent",
			"http://www.snik.eu/ontology/bb/3LGM2PhysicalToolLayer",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/meta/isBasedOn",
			"http://www.snik.eu/ontology/bb/UmlClassDiagram",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/FunctionalMetamodel",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/InformationSystemMetamodel",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/OrganizationalMetamodel",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/TechnicalMetamodel",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2ApplicationComponent",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationInterface",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2ApplicationComponent",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/3LGM2EnterpriseFunction",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2B",
			"http://www.w3.org/2000/01/rdf-schema#subClassOf",
			"http://www.snik.eu/ontology/bb/3LGM2",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationInterface",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/3LGM2EntityType",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationLink",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationInterface",
			"http://www.snik.eu/ontology/bb",
		],
		[
			"http://www.snik.eu/ontology/bb/3LGM2CommunicationLink",
			"http://www.snik.eu/ontology/meta/isAssociatedWith",
			"http://www.snik.eu/ontology/bb/3LGM2EntityType",
			"http://www.snik.eu/ontology/bb",
		],
	],
	["c", "p", "d", "g", "ax"]
);

/** Recorded response for fuse-index.json, reduced to the values the tests need. */
export const fuseIndex: SparqlResponse = response(
	["uri", "l", "def"],
	[
		[
			"http://www.snik.eu/ontology/bb/OrganizationalUnit",
			"Organisationseinheit|Organizational Unit|واحد سازمانی",
			"Part of an institution which can be defined by responsibilities (e.g., the radiology department). Organizational units perform enterprise functions.",
		],
		["http://www.snik.eu/ontology/meta/EntityType", "Objekttyp|entity type", ""],
		["http://www.snik.eu/ontology/he/ChiefExecutiveOfficer", "CEO|Chief Executive Officer|Geschäftsführer|Vorstandsvorsitzender", "Chief Executive Officer."],
		[
			"http://www.snik.eu/ontology/bb/3LGM2EntityType",
			"3LGM² Entity Type|نوع عنصر 3LGM ²",
			"An entity type is a representation of 1. an object class and of 2. the data representing information concerning the objects of this object class, if these data are stored or could or should be stored in the information system.",
		],
		[
			"http://www.snik.eu/ontology/meta/Role",
			"Rolle|role",
			"Unter einer Rolle verstehen wir die Summe von Erwartungen, die an eine Person gerichtet werden. Sie beschreibt ein Bündel von zu erfüllenden Aufgaben und den daraus abgeleiteten Pflichten und den hierfür notwendigen Rechten.",
		],
		[
			"http://www.snik.eu/ontology/bb/ChiefExecutiveOfficer",
			"CEO|Chief Executive Officer|Geschäftsführer|Vorstandsvorsitzender",
			"Responsible for setting and carrying out the strategic plans and policies of an enterprise.",
		],
		["http://www.snik.eu/ontology/ciox/ChiefExecutiveOfficer", "CEO|Chief Executive Officer|Geschäftsführer", ""],
		[
			"http://www.snik.eu/ontology/ob/OrganizationalUnit",
			"Organisationseinheit|Organizational Unit",
			"Ein von der Unternehmensleitung festgelegter Bereich mit klar definierten Aufgaben und definierten Verantwortlichkeiten. Eine Organisationseinheit in einem Krankenhaus ist beispielsweise eine Klinik, die sich in Abteilungen gliedern kann, welche wiederum aus einzelnen Ambulanzen und Stationen bestehen können.",
		],
		["http://www.snik.eu/ontology/meta/Function", "Aufgabe|Function", ""],
		[
			"http://www.snik.eu/ontology/bb/HospitalInformationSystem",
			"Hospital Information System|Krankenhausinformationssystem|سیستم اطلاعات بیمارستانی",
			"Socio-technical subsystem of a hospital that comprises all information processing as well as the associated human or technical actors in their respective information processing roles. The aim of a hospital information system is to sufficiently enable the adequate execution of hospital functions for patient care.",
		],
		[
			"http://www.snik.eu/ontology/ob/HospitalInformationSystem",
			"Hospital Information System|Krankenhausinformationssystem",
			"Ein Krankenhausinformationssystem ist das Informationssystem der Einrichtung „Krankenhaus“.",
		],
		[
			"http://www.snik.eu/ontology/bb/ComputerBasedInformationSystem",
			"Computer-Based Information System|Rechnerunterstütztes Informationssystem|سیستم اطلاعاتی مبتنی بر کامپیوتر",
			"An information system that comprises (among others) computer-based information processing tools.",
		],
		["http://www.snik.eu/ontology/bb/MonolithicArchitecture", "Monolithic Architecture|معماری یکپارچه", ""],
		[
			"http://www.snik.eu/ontology/bb/BestOfBreedArchitecture",
			"Best-of-Breed-Architecture|معماری بهترین نژاد",
			"An (AC n , V n ) architecture where the different application components are based on software from different vendors is commonly denoted as “best-of-breed,” pointing to the fact that the hospital combines the “best” software products from different vendors.",
		],
		["http://www.snik.eu/ontology/bb/LogicalToolLayer", "Logical Tool Layer|لایه ابزار منطفی", ""],
		["http://www.snik.eu/ontology/ob/LogicalToolLayer", "Logical Tool Layer", ""],
		[
			"http://www.snik.eu/ontology/he/IstzustandErheben",
			"Istzustand Erheben",
			"Zu den Wettbewerbsfaktoren werden die aktuellen Werte ermittelt (z. B. die Auftragsabwicklungszeit gemessen in Tagen) und im Vergleich zu den wichtigsten Mitbewerbern beurteilt (z. B. methodisch unterstützt durch Competitive Benchmarking vgl. Lerneinheit MEGPM).",
		],
	],
	["uri"]
);
