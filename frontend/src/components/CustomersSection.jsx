import { Search, Trash2, Users } from 'lucide-react';

import { SectionTitle, Table } from './common.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function CustomersSection({
  customerForm,
  customerQuery,
  filteredCustomers,
  selectedCustomer,
  selectedCustomerOrders,
  onDelete,
  onFormChange,
  onQueryChange,
  onSave,
  onSelectCustomer,
}) {
  return (
    <section id="customers" className="panel-grid">
      <form className="panel form-panel" onSubmit={onSave}>
        <SectionTitle icon={<Users />} title="Add Customer" />
        <input required placeholder="Full name" value={customerForm.full_name} onChange={(event) => onFormChange({ full_name: event.target.value })} />
        <input required type="email" placeholder="Email address" value={customerForm.email} onChange={(event) => onFormChange({ email: event.target.value })} />
        <input required placeholder="Phone number" value={customerForm.phone} onChange={(event) => onFormChange({ phone: event.target.value })} />
        <button type="submit">Add Customer</button>
      </form>

      <div className="panel">
        <SectionTitle icon={<Users />} title="Customer List" />
        <label className="search-box full">
          <Search size={17} />
          <input placeholder="Search customers" value={customerQuery} onChange={(event) => onQueryChange(event.target.value)} />
        </label>
        <Table headers={['Customer ID', 'Name', 'Email', 'Phone', '']}>
          {filteredCustomers.map((customer) => (
            <tr
              className={selectedCustomer?.id === customer.id ? 'clickable-row selected' : 'clickable-row'}
              key={customer.id}
              onClick={() => onSelectCustomer(customer)}
            >
              <td>#{customer.id}</td>
              <td>{customer.full_name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td className="actions">
                <button
                  type="button"
                  className="small danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(customer.id);
                  }}
                  title="Delete customer"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {selectedCustomer && (
          <div className="customer-orders-panel">
            <div className="customer-orders-header">
              <SectionTitle icon={<Users />} title={`${selectedCustomer.full_name}'s Orders`} />
              <button type="button" className="small secondary" onClick={() => onSelectCustomer(null)}>Clear</button>
            </div>
            {selectedCustomerOrders.length === 0 && <p className="empty-state">No orders found for this customer.</p>}
            <div className="mini-order-list">
              {selectedCustomerOrders.map((order) => (
                <article className="mini-order-card" key={order.id}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <span>{order.items.map((item) => `${item.product_name} x ${item.quantity}`).join(', ')}</span>
                  <strong>{formatCurrency(order.total_amount)}</strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
