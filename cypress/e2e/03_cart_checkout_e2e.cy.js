/**
 * PRUEBA E2E 3: Flujo Completo de Carrito y Checkout
 * Objetivo: Validar la experiencia integral de compra (Agregar -> Carrito -> Checkout -> Orden Confirmada).
 */
describe('E2E: Flujo Integral de Compra (Carrito y Checkout)', () => {
  it('Debería completar el ciclo de compra desde el catálogo hasta la orden confirmada', () => {
    // 1. Visitar catálogo
    cy.visit('/');

    // 2. Agregar primer producto al carrito
    cy.get('.producto-card').first().within(() => {
      cy.get('button.btn-card-add').click();
    });

    // 3. Validar notificación en pantalla y badge del carrito
    cy.get('.contador-carrito').should('contain.text', '1');
    cy.screenshot('09-producto-agregado-al-carrito');

    // 4. Ir a la vista del carrito
    cy.visit('/carrito');
    cy.get('h2').should('contain.text', 'Mi Carrito de Compras');
    cy.get('.cart-item-card').should('have.length', 1);

    // 5. Incrementar cantidad con el stepper
    cy.get('.qty-stepper button').last().click(); // botón +
    cy.get('.contador-carrito').should('contain.text', '2');
    cy.screenshot('10-carrito-con-items-actualizados');

    // 6. Proceder al pago (Checkout)
    cy.contains('a', 'Proceder al Pago').click();
    cy.url().should('include', '/finalizar-pedido');
    cy.get('h2').should('contain.text', 'Finalizar Pedido');

    // 7. Llenar información de compra y envío
    cy.get('input[name="nombreCompleto"]').clear().type('Harry Sly Rodríguez Sandoval');
    cy.get('input[name="correo"]').clear().type('usuario@stylehub.com');
    cy.get('input[name="documento"]').clear().type('72345678');
    cy.get('input[name="telefono"]').clear().type('987654321');
    cy.get('input[name="direccion"]').clear().type('Av. Universitaria 1801, San Miguel');
    cy.get('input[name="ciudad"]').clear().type('Lima');

    // 8. Seleccionar método de pago (Tarjeta) y llenar datos
    cy.get('input[value="tarjeta"]').check({ force: true });
    cy.get('input[name="titular"]').type('HARRY S RODRIGUEZ');
    cy.get('input[name="numeroTarjeta"]').type('4557 1234 5678 9012');
    cy.get('input[name="vencimiento"]').type('12/28');
    cy.get('input[name="cvv"]').type('123');

    cy.screenshot('11-formulario-checkout-completado');

    // 9. Confirmar la orden
    cy.get('button[type="submit"]').contains('Confirmar').click();

    // 10. Validar pantalla de orden confirmada con código de seguimiento
    cy.get('.receipt-card', { timeout: 10000 }).should('be.visible');
    cy.get('h2').should('contain.text', '¡Orden Confirmada con Éxito!');
    cy.contains('Código de Seguimiento:').should('be.visible');
    cy.screenshot('12-recibo-orden-confirmada');
  });
});
