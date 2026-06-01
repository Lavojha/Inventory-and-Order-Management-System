import { Package, Plus, Search, Trash2 } from 'lucide-react';

import { SectionTitle, Table } from './common.jsx';
import { formatCurrency } from '../utils/formatters.js';

export function ProductsSection({
  editingProductId,
  filteredProducts,
  productForm,
  productQuery,
  productSort,
  onCancelEdit,
  onDelete,
  onEdit,
  onFormChange,
  onQueryChange,
  onRestock,
  onSave,
  onSortChange,
}) {
  return (
    <section id="products" className="panel-grid">
      <form className="panel form-panel" onSubmit={onSave}>
        <SectionTitle icon={<Plus />} title={editingProductId ? 'Update Product' : 'Add Product'} />
        <input required placeholder="Product name" value={productForm.name} onChange={(event) => onFormChange({ name: event.target.value })} />
        <input required placeholder="SKU/code" value={productForm.sku} onChange={(event) => onFormChange({ sku: event.target.value })} />
        <input required min="0" step="0.01" type="number" placeholder="Price in INR" value={productForm.price} onChange={(event) => onFormChange({ price: event.target.value })} />
        <input required min="0" type="number" placeholder="Quantity in stock" value={productForm.quantity_in_stock} onChange={(event) => onFormChange({ quantity_in_stock: event.target.value })} />
        <div className="button-row">
          <button type="submit">{editingProductId ? 'Save Product' : 'Add Product'}</button>
          {editingProductId && <button type="button" className="secondary" onClick={onCancelEdit}>Cancel</button>}
        </div>
      </form>

      <div className="panel">
        <SectionTitle icon={<Package />} title="Product List" />
        <div className="toolbar">
          <label className="search-box">
            <Search size={17} />
            <input placeholder="Search products or SKU" value={productQuery} onChange={(event) => onQueryChange(event.target.value)} />
          </label>
          <select value={productSort} onChange={(event) => onSortChange(event.target.value)} title="Sort products">
            <option value="stock-asc">Stock: low first</option>
            <option value="stock-desc">Stock: high first</option>
            <option value="price-desc">Price: high first</option>
            <option value="name-asc">Name: A-Z</option>
          </select>
        </div>
        <Table headers={['Name', 'SKU', 'Price', 'Stock', '']}>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{formatCurrency(product.price)}</td>
              <td><span className={product.quantity_in_stock <= 5 ? 'pill danger' : 'pill'}>{product.quantity_in_stock}</span></td>
              <td className="actions">
                <button type="button" className="small secondary" onClick={() => onRestock(product, 10)}>+10</button>
                <button type="button" className="small" onClick={() => onEdit(product)}>Edit</button>
                <button type="button" className="small danger" onClick={() => onDelete(product.id)} title="Delete product"><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </section>
  );
}
