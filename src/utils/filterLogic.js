/**
 * Lógica pura de filtrado y búsqueda de productos (Pruebas Unitarias)
 */

export function filterProductsByCategory(products = [], category = 'todos') {
  if (!Array.isArray(products)) return [];
  if (!category || category.toLowerCase() === 'todos') {
    return products;
  }
  return products.filter(
    p => p && p.categoria && p.categoria.toLowerCase() === category.toLowerCase()
  );
}

export function searchProducts(products = [], searchTerm = '') {
  if (!Array.isArray(products)) return [];
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return products;
  }
  const term = searchTerm.trim().toLowerCase();
  return products.filter(
    p =>
      (p.nombre && p.nombre.toLowerCase().includes(term)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
  );
}
