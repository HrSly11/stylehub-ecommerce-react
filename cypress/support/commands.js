// Custom commands para agilizar pruebas E2E
Cypress.Commands.add('loginDemo', (correo = 'usuario@stylehub.com', clave = '1234') => {
  cy.visit('/inicio-sesion');
  cy.get('input[name="correo"]').clear().type(correo);
  cy.get('input[name="clave"]').clear().type(clave);
  cy.get('button[type="submit"]').click();
});
