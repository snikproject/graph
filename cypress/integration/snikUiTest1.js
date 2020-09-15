/* eslint-disable */

describe('My First Test', () =>
{
  it('finds the contents of the menu', () =>
  {
    cy.visit('./index.html');
    cy.wait(8000);
    cy.contains('File').click();
    cy.contains('Filter').click();
    cy.contains('Options').click();
    cy.get('.dropdown-menu').contains('Layout').click();
    cy.contains('Services').click();
    cy.contains('Language').click();
    //cy.contains('german').click();
    cy.contains('Help').click();
  });

  it('tests the search field', () =>
  {
    //cy.wait(10000);
    cy.get('#search-field')
      .type('Testsuche')
      .should('have.value', 'Testsuche');

  });
});
describe('Golden Layout Test', ()=>
{
  it('open new Tab, rename it and go back to start', () =>
  {
    cy.get('.addsign').click();
    //cy.wait(2000);
    cy.get('.dropdown-menu').contains('Layout').click();
    cy.contains('change title of active View').click();
    cy.contains('Gesamtmodell').click();
});
});
describe('Zoom test', () =>
{
  it('zoom in and zoom out in the Gesamtmodell', () =>
  {
  //Zoom in
  cy.get('.plussign')
    .click()
    .click()
    .click()
    .click()
    .click();

  //Zoom out
  cy.get('.minussign')
    .click()
    .click()
    .click()
    .click()
    .click();
  });
});
