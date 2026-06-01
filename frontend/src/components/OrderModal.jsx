import { X } from 'lucide-react';

import { formatCurrency, formatDate } from '../utils/formatters.js';

export function OrderModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order #{order.id}</h2>
            <p>{order.customer_name}</p>
            <p>{formatDate(order.created_at)}</p>
          </div>
          <button className="icon-button secondary" onClick={onClose} title="Close order details">
            <X size={18} />
          </button>
        </div>
        <div className="detail-list">
          {order.items.map((item) => (
            <div className="detail-row" key={item.id}>
              <span>{item.product_name}</span>
              <span>{item.sku}</span>
              <span>{item.quantity} x {formatCurrency(item.unit_price)}</span>
              <strong>{formatCurrency(item.line_total)}</strong>
            </div>
          ))}
        </div>
        <div className="modal-total">
          <span>Total amount</span>
          <strong>{formatCurrency(order.total_amount)}</strong>
        </div>
      </section>
    </div>
  );
}
