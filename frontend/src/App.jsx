import { useEffect, useMemo, useState } from 'react';

import { api } from './api/client.js';
import { CustomersSection } from './components/CustomersSection.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { Layout } from './components/Layout.jsx';
import { OrderModal } from './components/OrderModal.jsx';
import { OrdersSection } from './components/OrdersSection.jsx';
import { ProductsSection } from './components/ProductsSection.jsx';
import { Notice } from './components/common.jsx';

const emptyDashboard = {
  total_products: 0,
  total_customers: 0,
  total_orders: 0,
  low_stock_products: [],
};

const emptyProductForm = { name: '', sku: '', price: '', quantity_in_stock: '' };
const emptyCustomerForm = { full_name: '', email: '', phone: '' };
const emptyOrderForm = { customer_id: '', items: [{ product_id: '', quantity: 1 }] };

export default function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [productQuery, setProductQuery] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [productSort, setProductSort] = useState('stock-asc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [orderQuery, setOrderQuery] = useState('');
  const [orderCustomerFilter, setOrderCustomerFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const orderEstimate = useMemo(() => orderForm.items.reduce((total, item) => {
    const product = products.find((entry) => entry.id === Number(item.product_id));
    return total + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
  }, 0), [orderForm.items, products]);

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    const visible = products.filter((product) => (
      product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
    ));

    return [...visible].sort((a, b) => {
      if (productSort === 'stock-asc') return a.quantity_in_stock - b.quantity_in_stock;
      if (productSort === 'stock-desc') return b.quantity_in_stock - a.quantity_in_stock;
      if (productSort === 'price-desc') return Number(b.price) - Number(a.price);
      return a.name.localeCompare(b.name);
    });
  }, [productQuery, productSort, products]);

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    return customers.filter((customer) => (
      customer.full_name.toLowerCase().includes(query)
      || customer.email.toLowerCase().includes(query)
      || customer.phone.toLowerCase().includes(query)
    ));
  }, [customerQuery, customers]);

  const inventoryValue = useMemo(() => products.reduce(
    (total, product) => total + Number(product.price) * product.quantity_in_stock,
    0,
  ), [products]);

  const salesValue = useMemo(() => orders.reduce(
    (total, order) => total + Number(order.total_amount),
    0,
  ), [orders]);

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    const today = new Date().toDateString();

    return orders.filter((order) => {
      const orderText = [
        `order #${order.id}`,
        order.customer_name,
        ...order.items.flatMap((item) => [item.product_name, item.sku]),
      ].join(' ').toLowerCase();
      const matchesSearch = !query || orderText.includes(query);
      const matchesCustomer = orderCustomerFilter === 'all' || order.customer_id === Number(orderCustomerFilter);
      const matchesDate = orderDateFilter === 'all' || (
        orderDateFilter === 'today' && new Date(order.created_at).toDateString() === today
      );
      return matchesSearch && matchesCustomer && matchesDate;
    });
  }, [orderCustomerFilter, orderDateFilter, orderQuery, orders]);

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((order) => order.customer_id === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  async function loadAll() {
    setLoading(true);
    try {
      const [productData, customerData, orderData, dashboardData] = await Promise.all([
        api('/products'),
        api('/customers'),
        api('/orders'),
        api('/dashboard'),
      ]);
      setProducts(productData);
      setCustomers(customerData);
      setOrders(orderData);
      setDashboard(dashboardData);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showSuccess(text) {
    setNotice({ type: 'success', text });
  }

  async function refreshData() {
    await loadAll();
    showSuccess('Data refreshed.');
  }

  function navigate(page, targetId) {
    setActivePage(page);
    window.history.replaceState(null, '', `#${targetId || page}`);
    if (targetId) {
      setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } else {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      quantity_in_stock: Number(productForm.quantity_in_stock),
    };

    try {
      if (editingProductId) {
        await api(`/products/${editingProductId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showSuccess('Product updated.');
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        showSuccess('Product created.');
      }
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
  }

  function cancelProductEdit() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      showSuccess('Product deleted.');
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function restockProduct(product, amount) {
    try {
      await api(`/products/${product.id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity_in_stock: product.quantity_in_stock + amount }),
      });
      showSuccess(`${product.name} stock increased by ${amount}.`);
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function saveCustomer(event) {
    event.preventDefault();
    try {
      await api('/customers', { method: 'POST', body: JSON.stringify(customerForm) });
      setCustomerForm(emptyCustomerForm);
      showSuccess('Customer created.');
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function deleteCustomer(id) {
    if (!confirm('Delete this customer and their orders?')) return;
    try {
      await api(`/customers/${id}`, { method: 'DELETE' });
      showSuccess('Customer deleted.');
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function createOrder(event) {
    event.preventDefault();
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: Number(orderForm.customer_id),
          items: orderForm.items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
        }),
      });
      setOrderForm(emptyOrderForm);
      showSuccess('Order created and stock reduced.');
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  function updateOrderItem(index, changes) {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)),
    });
  }

  function addOrderItem() {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { product_id: '', quantity: 1 }] });
  }

  function removeOrderItem(index) {
    setOrderForm({ ...orderForm, items: orderForm.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  async function deleteOrder(id) {
    if (!confirm('Cancel this order? Stock will be returned.')) return;
    try {
      await api(`/orders/${id}`, { method: 'DELETE' });
      showSuccess('Order cancelled and stock restored.');
      loadAll();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  return (
    <Layout activePage={activePage} loading={loading} onNavigate={navigate} onRefresh={refreshData}>
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      {activePage === 'dashboard' && (
        <Dashboard
          dashboard={dashboard}
          inventoryValue={inventoryValue}
          salesValue={salesValue}
          onNavigate={navigate}
          onRestock={restockProduct}
        />
      )}
      {activePage === 'products' && (
        <ProductsSection
          editingProductId={editingProductId}
          filteredProducts={filteredProducts}
          productForm={productForm}
          productQuery={productQuery}
          productSort={productSort}
          onCancelEdit={cancelProductEdit}
          onDelete={deleteProduct}
          onEdit={editProduct}
          onFormChange={(changes) => setProductForm({ ...productForm, ...changes })}
          onQueryChange={setProductQuery}
          onRestock={restockProduct}
          onSave={saveProduct}
          onSortChange={setProductSort}
        />
      )}
      {activePage === 'customers' && (
        <CustomersSection
          customerForm={customerForm}
          customerQuery={customerQuery}
          filteredCustomers={filteredCustomers}
          selectedCustomer={selectedCustomer}
          selectedCustomerOrders={selectedCustomerOrders}
          onDelete={deleteCustomer}
          onFormChange={(changes) => setCustomerForm({ ...customerForm, ...changes })}
          onQueryChange={setCustomerQuery}
          onSave={saveCustomer}
          onSelectCustomer={setSelectedCustomer}
        />
      )}
      {activePage === 'orders' && (
        <OrdersSection
          customers={customers}
          filteredOrders={filteredOrders}
          orderCustomerFilter={orderCustomerFilter}
          orderDateFilter={orderDateFilter}
          orderEstimate={orderEstimate}
          orderForm={orderForm}
          orderQuery={orderQuery}
          products={products}
          onAddItem={addOrderItem}
          onCreate={createOrder}
          onDelete={deleteOrder}
          onFilterCustomer={setOrderCustomerFilter}
          onFilterDate={setOrderDateFilter}
          onQueryChange={setOrderQuery}
          onRemoveItem={removeOrderItem}
          onSelectOrder={setSelectedOrder}
          onUpdateCustomer={(customerId) => setOrderForm({ ...orderForm, customer_id: customerId })}
          onUpdateItem={updateOrderItem}
        />
      )}
      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </Layout>
  );
}
