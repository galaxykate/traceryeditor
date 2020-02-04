var assert = require('assert');

Feature('jodit');

Scenario('should have correct initial value', async (I) => {
  I.amOnPage('string-jodit-editor.html');
  I.click('.get-value');
  assert.equal(await I.grabValueFrom('.debug'), '[]');
});

Scenario('should have coerent values', async (I) => {
  I.amOnPage('string-jodit-editor.html');
  I.click('Add item');
  I.see('item 1');
  I.seeElement('.jodit_wysiwyg');

  I.click('.jodit_toolbar_btn-bold a');
  I.pressKeys('__JODIT__');
  I.see('__JODIT__');

  I.click('.get-value');
  assert.equal(await I.grabValueFrom('.debug'), JSON.stringify([{"editor":"<strong>__JODIT__</strong>"}]));

});
