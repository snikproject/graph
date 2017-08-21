var config =
{
  defaultSubOntologies: ["meta","bb","ob","ciox","he","it4it","it"],
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
  layoutCacheMinPrecision: 0.2,
};
