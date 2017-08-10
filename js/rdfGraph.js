// SPARQL graphs

export const helper = () => new Set(["virtual","limes-exact"]);
export const subs =  () => new Set(["meta","ob","bb","he","it","it4it"]);
export const all =  () => new Set([...helper(),...subs()]);

export const active = new Set(subs);
