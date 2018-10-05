var config =
{
  defaultSubOntologies: ["meta","bb","ob","ciox","he","it4it"],
  // levels: error, warn, info, debug, trace
  logLevelConsole: "debug",
  logLevelDisplay: "info",
  // recalculate layout at the start when those conditions aren't met
  // proportion of nodes that can be assigned a position
  // e.g. a recall of 0.9 means that 10% of the nodes are not layouted
  layoutCacheMinRecall: 0.95,
  // proportion of cached nodes that are present in the active graph
  // a low precison means that the cached layout was calculated with
  // a very dissimilar graph
  layoutCacheMinPrecision: 0.5,
  language: "en",
  download:
  {
    image:
    {
      // browsers have different undocumented maximum file sizes
      // see https://github.com/cytoscape/cytoscape.js/issues/1943#issuecomment-324104342
      // the default values have been tested on SNIK graph on Firefox 55 but if
      // they turn out to be too high for other browsers, the resolution can be adjusted here.
      // high resolution
      max: {width: 11250, height: 11250},
      // standard resolution
      // only used for full graph export, view uses native resolution
      standard: {width: 1920, height: 1920},
    },
  },
};
