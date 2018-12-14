import * as language from '../js/lang/language.js';
import chai from 'chai';
chai.should();
const assert = chai.assert;

describe('language', function()
{
  describe('#getStrings()', function()
  {
    for(const lang of ['en','de'])
    {
      it('should contain the language '+lang,()=>
      {
        assert(language.setLanguage(lang),"Language not found.");
        assert.isAbove(Object.keys(language.getStrings()).length,29);
        assert.isOk(language.getString("file"),"Key 'file' not found.");
      });
    }
  });
});
