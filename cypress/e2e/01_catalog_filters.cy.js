/**
 * PRUEBA E2E 1: Catálogo de Productos y Filtros Reactivos
 * Objetivo: Validar la carga inicial del frontend, intercepción de la API de productos y filtros por categoría.
 */
describe('E2E: Catálogo de Productos y Navegación', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería cargar la página principal con el hero banner y el catálogo completo', () => {
    cy.get('h2').should('contain.text', 'Moda y estilo para cada miembro de la familia');
    cy.get('.productos-grid').should('be.visible');
    cy.get('.producto-card').should('have.length.at.least', 4);
    cy.screenshot('01-catalogo-completo');
  });

  it('Debería filtrar los productos correctamente al hacer clic en "Hombres"', () => {
    cy.contains('button.filtro-pill', 'Hombres').click();
    cy.get('.filtro-pill.activo').should('contain.text', 'Hombres');
    cy.get('.producto-card').each(($card) => {
      cy.wrap($card).find('.categoria-tag').should('contain.text', 'hombres');
    });
    cy.screenshot('02-filtro-hombres');
  });

  it('Debería filtrar los productos correctamente al hacer clic en "Mujeres"', () => {
    cy.contains('button.filtro-pill', 'Mujeres').click();
    cy.get('.filtro-pill.activo').should('contain.text', 'Mujeres');
    cy.get('.producto-card').each(($card) => {
      cy.wrap($card).find('.categoria-tag').should('contain.text', 'mujeres');
    });
    cy.screenshot('03-filtro-mujeres');
  });

  it('Debería filtrar los productos correctamente al hacer clic en "Niños"', () => {
    cy.contains('button.filtro-pill', 'Niños').click();
    cy.get('.filtro-pill.activo').should('contain.text', 'Niños');
    cy.get('.producto-card').each(($card) => {
      cy.wrap($card).find('.categoria-tag').should('contain.text', 'Niños');
    });
    cy.screenshot('04-filtro-ninos');
  });
});
