import { filterProductsByCategory, searchProducts } from '../../src/utils/filterLogic';

/**
 * PRUEBAS UNITARIAS: Filtrado y Búsqueda de Productos
 * Objetivo: Validar la segmentación por categorías (Hombres, Mujeres, Niños) y coincidencias de texto.
 */
describe('Pruebas Unitarias: filterLogic (Filtrado de Catálogo)', () => {
  const sampleProducts = [
    { id: 1, nombre: 'Camisa Casual Azul', categoria: 'hombres', precio: 79.90, descripcion: 'Camisa de algodón' },
    { id: 2, nombre: 'Pantalón Jean Slim', categoria: 'hombres', precio: 99.90, descripcion: 'Jean corte slim' },
    { id: 3, nombre: 'Blusa Floral', categoria: 'mujeres', precio: 69.90, descripcion: 'Blusa ligera de verano' },
    { id: 4, nombre: 'Polo Infantil Estampado', categoria: 'ninos', precio: 39.90, descripcion: 'Polo de algodón' },
  ];

  it('Debería retornar todos los productos cuando la categoría es "todos"', () => {
    const result = filterProductsByCategory(sampleProducts, 'todos');
    expect(result).toHaveLength(4);
  });

  it('Debería filtrar únicamente productos de la categoría "hombres"', () => {
    const result = filterProductsByCategory(sampleProducts, 'hombres');
    expect(result).toHaveLength(2);
    expect(result.every(p => p.categoria === 'hombres')).toBe(true);
  });

  it('Debería filtrar únicamente productos de la categoría "mujeres"', () => {
    const result = filterProductsByCategory(sampleProducts, 'mujeres');
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Blusa Floral');
  });

  it('Debería ser insensible a mayúsculas y minúsculas en el nombre de la categoría', () => {
    const result = filterProductsByCategory(sampleProducts, 'NINOS');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('Debería buscar productos por coincidencia en el título o descripción', () => {
    const result = searchProducts(sampleProducts, 'algodón');
    expect(result).toHaveLength(2);
  });

  it('Debería retornar arreglo vacío si la lista de productos no es válida', () => {
    expect(filterProductsByCategory(null, 'hombres')).toEqual([]);
    expect(searchProducts(undefined, 'jean')).toEqual([]);
  });
});
