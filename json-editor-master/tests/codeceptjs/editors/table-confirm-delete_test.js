var assert = require('assert');

Feature('table');

Scenario('should have correct initial value', async (I) => {
  I.amOnPage('table.html');
  I.click('.get-value');
  assert.equal(await I.grabValueFrom('.debug'), '[]');
});

Scenario('should ask for confirmation on node delete', async (I) => {
  I.amOnPage('table.html');
  I.click('Add Node');
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.amCancellingPopups();
  I.click('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.cancelPopup();
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.amAcceptingPopups();
  I.click('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.acceptPopup();
  I.dontSeeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
});

Scenario('should ask for confirmation on node delete last', async (I) => {
  I.amOnPage('table.html');
  I.click('Add Node');
  I.click('Add Node');
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
  I.amCancellingPopups();
  I.click('Delete Last Node');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.cancelPopup();
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
  I.amAcceptingPopups();
  I.click('Delete Last Node');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.acceptPopup();
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.dontSeeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
});

Scenario('should ask for confirmation on node delete all', async (I) => {
  I.amOnPage('table.html');
  I.click('Add Node');
  I.click('Add Node');
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
  I.amCancellingPopups();
  I.click('Delete All');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.cancelPopup();
  I.seeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.seeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
  I.amAcceptingPopups();
  I.click('Delete All');
  I.seeInPopup('Are you sure you want to remove this node?');
  I.acceptPopup();
  I.dontSeeElement('[data-schemapath="root.0"] .json-editor-btn-delete');
  I.dontSeeElement('[data-schemapath="root.1"] .json-editor-btn-delete');
});
