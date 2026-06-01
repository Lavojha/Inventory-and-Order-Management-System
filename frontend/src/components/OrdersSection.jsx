import { ClipboardList, Eye, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';

import { SectionTitle } from './common.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function OrdersSection({
  customers,
  filteredOrders,
  orderCustomerFilter,
  orderDateFilter,
  orderEstimate,
  orderForm,
  orderQuery,
  products,
  onAddItem,
  onCreate,
  onDelete,
  onFilterCustomer,
  onFilterDate,
  onQueryChange,
  onRemoveItem,
  onSelectOrder,
  onUpdateCustomer,
  onUpdateItem,
}) {
  return (
    <section id="orders" className="panel-grid">
      <form className="panel form-panel" onSubmit={onCreate}>
        <SectionTitle icon={<ShoppingCart />} title="Create Order" />
        <select required value={orderForm.customer_id} onChange={(event) => onUpdateCustomer(event.target.value)}>
          <option value="">Select customer</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
        </select>
        <div className="order-lines">
          {orderForm.items.map((item, index) => {
            const selected = products.find((product) => product.id === Number(item.product_id));
            return (
              <div className="order-line" key={`${index}-${item.product_id}`}>
                <select required value={item.product_id} onChange={(event) => onUpdateItem(index, { product_id: event.target.value })}>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.quantity_in_stock} in stock)</option>)}
                </select>
                <input required min="1" max={selected?.quantity_in_stock || undefined} type="number" placeholder="Qty" value={item.quantity} onChange={(event) => onUpdateItem(index, { quantity: event.target.value })} />
                {orderForm.items.length > 1 && (
                  <button type="button" className="small danger" onClick={() => onRemoveItem(index)} title="Remove item">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" className="secondary" onClick={onAddItem}><Plus size={16} /> Add Item</button>
        <p className="helper">Estimated total: {formatCurrency(orderEstimate)}</p>
        <button type="submit">Create Order</button>
      </form>

      <div className="panel">
        <SectionTitle icon={<ClipboardList />} title="Orders" />
        <div className="toolbar order-toolbar">
          <label className="search-box">
            <Search size={17} />
            <input placeholder="Search order, customer, product, SKU" value={orderQuery} onChange={(event) => onQueryChange(event.target.value)} />
          </label>
          <select value={orderCustomerFilter} onChange={(event) => onFilterCustomer(event.target.value)} title="Filter by customer">
            <option value="all">All customers</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
          </select>
          <select value={orderDateFilter} onChange={(event) => onFilterDate(event.target.value)} title="Filter by date">
            <option value="all">All dates</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div className="order-list">
          {filteredOrders.length === 0 && <p className="empty-state">No orders match your filters.</p>}
          {filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <strong>Order #{order.id}</strong>
                  <span>{order.customer_name}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="order-actions">
                  <button type="button" className="small secondary" onClick={() => onSelectOrder(order)}><Eye size={15} /> View</button>
                  <button type="button" className="small danger" onClick={() => onDelete(order.id)}>Cancel</button>
                </div>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <span key={item.id}>{item.product_name} x {item.quantity} = {formatCurrency(item.line_total)}</span>
                ))}
              </div>
              <div className="order-footer">
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
