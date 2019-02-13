/** @module */

export default
{
  "defaultSubOntologies": ["meta","bb","ob","ciox","he","it4it"],
  "allSubOntologies": ["meta","bb","ob","ciox","he","it4it"],
  "helperGraphs": ["limes-exact","match"],
  "searchCloseMatch": true,
  'openMenuEvents': 'cxttapstart', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here, see https://github.com/cytoscape/cytoscape.js-cxtmenu
  "logLevelConsole": "info",
  "logLevelDisplay": "error",
  "layoutCacheMinRecall": 0.95,
  "layoutCacheMinPrecision": 0.5,
  "language": "en",
  "download":
  {
    "image":
    {
      "max": {"width": 5000, "height": 4000},
      "standard": {"width": 1920, "height": 1920},
    },
  },
};
