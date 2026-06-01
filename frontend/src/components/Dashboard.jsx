import { AlertCircle, ClipboardList, Package, TrendingUp, Users } from 'lucide-react';

import { Metric, SectionTitle } from './common.jsx';
import { formatCurrency } from '../utils/formatters.js';

export function Dashboard({ dashboard, inventoryValue, salesValue, onNavigate, onRestock }) {
  return (
    <>
      <section id="dashboard" className="metrics">
        <Metric icon={<Package />} label="Products" value={dashboard.total_products} onClick={() => onNavigate('products')} />
        <Metric icon={<Users />} label="Customers" value={dashboard.total_customers} onClick={() => onNavigate('customers')} />
        <Metric icon={<ClipboardList />} label="Orders" value={dashboard.total_orders} onClick={() => onNavigate('orders')} />
        <Metric icon={<AlertCircle />} label="Low Stock" value={dashboard.low_stock_products.length} onClick={() => onNavigate('dashboard', 'low-stock')} />
      </section>

      <section className="insights">
        <div id="low-stock" className="panel insight-panel">
          <SectionTitle icon={<TrendingUp />} title="Business Snapshot" />
          <div className="snapshot-grid">
            <div>
              <span>Inventory value</span>
              <strong>{formatCurrency(inventoryValue)}</strong>
            </div>
            <div>
              <span>Total order value</span>
              <strong>{formatCurrency(salesValue)}</strong>
            </div>
          </div>
        </div>
        <div className="panel insight-panel">
          <SectionTitle icon={<AlertCircle />} title="Low Stock Watchlist" />
          <div className="watchlist">
            {dashboard.low_stock_products.length === 0 && <span className="empty-state">No low-stock products.</span>}
            {dashboard.low_stock_products.slice(0, 5).map((product) => (
              <button className="watch-item" key={product.id} onClick={() => onRestock(product, 10)} title="Quick restock by 10">
                <span>{product.name}</span>
                <strong>{product.quantity_in_stock}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
