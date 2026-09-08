/**
 * PRUEBA E2E 2: Autenticación y Registro de Usuarios
 * Objetivo: Validar el inicio de sesión con usuario de prueba y validaciones de formulario.
 */
describe('E2E: Flujos de Autenticación (Login y Registro)', () => {
  it('Debería iniciar sesión correctamente con el usuario de prueba', () => {
    cy.visit('/inicio-sesion');
    cy.get('h2').should('contain.text', 'Iniciar Sesión');

    // Llenar formulario de login
    cy.get('input[name="correo"]').clear().type('usuario@stylehub.com');
    cy.get('input[name="clave"]').clear().type('1234');
    cy.screenshot('05-formulario-login-completado');

    cy.get('button[type="submit"]').click();

    // Validar mensaje de bienvenida y estado de sesión en header
    cy.get('.alert-success').should('contain.text', '¡Bienvenido(a)');
    cy.screenshot('06-login-exitoso');
  });

  it('Debería validar y permitir el registro de una cuenta nueva', () => {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    cy.visit('/registro');
    cy.get('h2').should('contain.text', 'Crear una Cuenta');

    cy.get('input[name="nombres"]').type('Harry');
    cy.get('input[name="apellidos"]').type('Rodríguez');
    cy.get('input[name="correo"]').type(`alumno_${randomId}@pucp.edu.pe`);
    cy.get('input[name="telefono"]').type('987654321');
    cy.get('input[name="ciudad"]').type('Lima');
    cy.get('input[name="direccion"]').type('Av. Universitaria 1801');
    cy.get('input[name="clave"]').type('pucp2026');
    cy.get('input[name="clave2"]').type('pucp2026');
    cy.get('input[name="terminos"]').check();

    cy.screenshot('07-formulario-registro-llenado');
    cy.get('button[type="submit"]').click();

    cy.get('.alert-success').should('contain.text', 'Registro exitoso');
    cy.screenshot('08-registro-exitoso');
  });
});
