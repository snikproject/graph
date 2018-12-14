import * as search from '../js/search.js';
import chai from 'chai';
const assert = chai.assert;

function equals(as, bs)
{
  if (as.size !== bs.size) {return false;}
  for (const a of as) {if (!bs.has(a)) {return false;}}
  return true;
}

describe('search', function()
{
  it('#search()', function()
  {
    const queries = ["Chief Information Officer","chief information officer","chiefinformationofficer"];
    const promises = queries.map(q=>search.search(q));
    return Promise.all(promises).then(results=>
    {
      // pairwise equality check
      for(let i=0;i<results.length;i++)
      {
        assert.isAbove(results[i].size,3,"not enough hits for "+queries[i]+": "+[...results[i]].join(' '));
        for(let j=i+1;j<results.length;j++)
        {
          assert(equals(results[i],results[j]),
            `different search results for queries "${queries[i]}" and "${queries[j]}":
Result 1: "${[...results[i]]}"
Result 2: "${[...results[j]]}"`);
        }
      }
    });
  });
});
