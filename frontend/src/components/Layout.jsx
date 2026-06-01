import { Package, RefreshCw } from 'lucide-react';

const pageCopy = {
  dashboard: {
    description: 'Track inventory value, order totals, and low-stock products.',
  },
  products: {
    description: 'Add, update, search, sort, and restock inventory items.',
  },
  customers: {
    description: 'Create customers and manage customer records.',
  },
  orders: {
    description: 'Create multi-item orders, review details, and manage stock movement.',
  },
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
];

export function Layout({ activePage, loading, onNavigate, onRefresh, children }) {
  const copy = pageCopy[activePage] || pageCopy.dashboard;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Package size={28} />
          <div>
            <strong>StockFlow</strong>
            <span>Inventory & Orders</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              className={activePage === item.id ? 'nav-link active' : 'nav-link'}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>Inventory & Order Management</h1>
            <p>{copy.description}</p>
          </div>
          <button className="icon-button topbar-refresh" disabled={loading} onClick={onRefresh} title="Refresh data" type="button">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
