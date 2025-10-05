'use client';

import React, { useState, useEffect } from 'react';
import { Package, CreditCard, MapPin, Calendar, Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string[];
}

interface OrderItem {
  productId?: string | { _id?: string };
  quantity: number;
  price: number;
  product?: string | Product;
}

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string[];
}

interface ShippingAddress {
  province: string;
  district: string;
  sector?: string;
  cell?: string;
  village?: string;
  street?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface Order {
  _id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'dpo' | string;
  dpoPaymentStatus?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

const OrdersComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const getAccessToken = (): string | null => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.user?.tokens?.accessToken || null;
    } catch {
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json', accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let response = await fetch('https://lindo-project.onrender.com/orders/getAllOrders', { headers });
      if (response.status === 404) {
        response = await fetch('https://lindo-project.onrender.com/orders/allOrders', { headers });
      }

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data?.orders || []);
        setErrorMessage('');
      } else if (response.status === 401) {
        setErrorMessage('Authentication required. Please log in.');
        setOrders([]);
      } else {
        setErrorMessage('Failed to fetch orders.');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Failed to fetch orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://lindo-project.onrender.com/product/getAllProduct');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data?.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const getProductById = (productId: string) => products.find(p => p._id === productId);

  const normalizeImageUrl = (src?: string) =>
    !src ? '' : src.startsWith('http') ? src : `https://lindo-project.onrender.com/${src}`;

  const getItemProductName = (item: OrderItem): string => {
    if (typeof item.product === 'string') return item.product;
    if (item.product && typeof item.product === 'object' && 'name' in item.product) return item.product.name;
    const pid = typeof item.productId === 'string' ? item.productId : item.productId?._id || '';
    const product = pid ? getProductById(pid) : undefined;
    return product?.name || `Product ${pid.slice(-8)}`;
  };

  const getItemProductImage = (item: OrderItem): string => {
    if (item.product && typeof item.product === 'object' && 'image' in item.product && item.product.image?.length) {
      return normalizeImageUrl(item.product.image[0]);
    }
    const pid = typeof item.productId === 'string' ? item.productId : item.productId?._id || '';
    const product = pid ? getProductById(pid) : undefined;
    return product?.image?.length ? normalizeImageUrl(product.image[0]) : '';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} className="text-green-600" />;
      case 'shipped': return <Truck size={16} className="text-blue-600" />;
      case 'processing': return <Clock size={16} className="text-yellow-600" />;
      case 'pending': return <Package size={16} className="text-orange-600" />;
      case 'cancelled': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (method: string) =>
    <CreditCard size={16} className={method === 'card' ? 'text-blue-600' : 'text-gray-600'} />;

  const formatShippingAddress = (addr: ShippingAddress | string) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const { province, district, sector, cell, village, street } = addr;
    return [province, district, sector, cell, village, street].filter(Boolean).join(', ');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`https://lindo-project.onrender.com/orders/updateOrderStatus/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setSuccessMessage('Order status updated successfully!');
        fetchOrders();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else setErrorMessage('Error updating order status');
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order =>
    (selectedStatus === 'all' || order.status === selectedStatus) &&
    (selectedPaymentMethod === 'all' || order.paymentMethod === selectedPaymentMethod)
  );

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders.filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, pending, delivered, cancelled, totalRevenue };
  };
  const stats = getStats();

    return (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-600 mt-1">Monitor and manage all customer orders efficiently</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Package size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-semibold">{stats.total} total orders</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <CreditCard size={16} className="text-green-600" />
                  <span className="text-green-700 font-semibold">Revenue: ${stats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <th className="px-6 py-3 font-semibold">Metric</th>
                    <th className="px-6 py-3 font-semibold text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package size={18} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Total Orders</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 align-middle text-center font-bold text-xl text-blue-600">{stats.total}</td>
                  </tr>
                  <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Delivered</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 align-middle text-center font-bold text-xl text-green-600">{stats.delivered}</td>
                  </tr>
                  <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle size={18} className="text-red-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Cancelled</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 align-middle text-center font-bold text-xl text-red-600">{stats.cancelled}</td>
                  </tr>
                  <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                    <td className="px-6 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CreditCard size={18} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Total Revenue</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 align-middle text-center font-bold text-xl text-green-600">${stats.totalRevenue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="dpo">DPO</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Customer Orders</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track order status updates</p>
            </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left">Customer</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left hidden lg:table-cell">Items</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left">Amount</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left">Status</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left hidden md:table-cell">Payment</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left hidden lg:table-cell">Shipping</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-left hidden sm:table-cell">Date</th>
                  <th className="px-4 lg:px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 lg:px-6 py-4 align-middle">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {order.user?.image && order.user.image.length > 0 ? (
                            <img
                              src={normalizeImageUrl(order.user.image[0])}
                              alt={order.user.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">
                            {order.user?.name || 'Unknown Customer'}
                          </div>
                          <div className="text-gray-600 text-sm truncate">{order.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle hidden lg:table-cell">
                      <div className="text-gray-900 font-semibold">{order.items.length} items</div>
                      <div className="text-gray-600 text-sm max-w-xs truncate">
                        {order.items.slice(0, 2).map(item => {
                            const productName = getItemProductName(item);
                            if (productName) return productName;
                            const pid = typeof item.productId === 'string' ? item.productId : '';
                            return `Product ${pid ? pid.slice(-8) : 'Unknown'}`;
                          }).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle">
                      <div className="font-bold text-lg text-green-600">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span className="text-gray-700 capitalize font-medium">
                          {String(order.paymentMethod || '').replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-600 text-sm max-w-xs truncate">
                          {formatShippingAddress(order.shippingAddress)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle text-gray-700 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-middle">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1"
                          title="View Order Details"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={14} /> 
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="text-xs border border-gray-300 text-blue-700 rounded-lg px-2 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
          {/* Order Details Modal */}
          {selectedOrder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
          <p className="text-sm text-gray-600 mt-1">
            Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedOrder._id}</span>
          </p>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700 text-3xl leading-none p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setSelectedOrder(null)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">

        {/* Customer and Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-blue-200">
                {selectedOrder.user?.image?.[0] ? (
                  <img src={normalizeImageUrl(selectedOrder.user.image[0])} alt="Customer" className="h-14 w-14 object-cover" />
                ) : (
                  <span className="text-lg font-bold text-blue-600">
                    {selectedOrder.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">{selectedOrder.user?.name || 'Unknown Customer'}</div>
                <div className="text-blue-600 text-sm">{selectedOrder.user?.email}</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="text-sm text-green-600 font-semibold mb-2">Payment Method</div>
            <div className="flex items-center gap-3 mb-4">
              {getPaymentMethodIcon(selectedOrder.paymentMethod)}
              <div className="text-gray-900 capitalize font-semibold">{String(selectedOrder.paymentMethod || '').replace('_', ' ')}</div>
            </div>
            <div className="text-sm text-green-600 font-semibold mb-2">Order Status</div>
            <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusBadgeColor(selectedOrder.status)}`}>
              {selectedOrder.status}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="text-sm text-purple-600 font-semibold mb-2">Order Timeline</div>
            <div className="text-gray-900 font-semibold mb-4">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
            <div className="text-sm text-purple-600 font-semibold mb-2">Last Updated</div>
            <div className="text-gray-900 font-semibold">{new Date(selectedOrder.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <div className="px-6 py-4 border-b border-orange-200 flex items-center gap-3">
            <MapPin size={20} className="text-orange-600" />
            <h4 className="font-bold text-gray-900 text-lg">Shipping Address</h4>
          </div>
          <div className="px-6 py-6 text-gray-800 space-y-3">
            <div className="font-semibold text-lg">{formatShippingAddress(selectedOrder.shippingAddress) || 'N/A'}</div>
            {selectedOrder.shippingAddress?.customerName && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">Name:</span> 
                <span className="font-medium">{selectedOrder.shippingAddress.customerName}</span>
              </div>
            )}
            {selectedOrder.shippingAddress?.customerPhone && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">Phone:</span> 
                <span className="font-medium">{selectedOrder.shippingAddress.customerPhone}</span>
              </div>
            )}
            {selectedOrder.shippingAddress?.customerEmail && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">Email:</span> 
                <span className="font-medium">{selectedOrder.shippingAddress.customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 w-full p-6">
          <h4 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-gray-600" />
            Order Items ({selectedOrder.items.length})
          </h4>
          <div className="space-y-4">
            {selectedOrder.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex-1">
                  <div className="font-bold text-blue-700 text-lg">{getItemProductName(item)}</div>
                  <div className="text-gray-600 text-sm mt-1">Quantity: {item.quantity}</div>
                  <div className="text-green-600 font-bold text-lg mt-2">Price: {item.price} Frw</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    Total: {(item.quantity * item.price).toFixed(2)} Frw
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="px-6 py-4 border-b border-green-200 bg-green-200">
              <h4 className="font-bold text-gray-900 text-lg">Order Summary</h4>
            </div>
            <div className="px-6 py-4 text-sm text-gray-700 flex items-center justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold">${selectedOrder.items.reduce((sum, it) => sum + (it.quantity || 1) * (it.price || 0), 0).toFixed(2)}</span>
            </div>
            <div className="px-6 py-4 text-sm text-gray-700 flex items-center justify-between">
              <span className="font-semibold">Shipping</span>
              <span className="font-bold">Free</span>
            </div>
            <div className="px-6 py-4 text-xl font-bold text-green-600 flex items-center justify-between border-t border-green-200 bg-green-100">
              <span>Total</span>
              <span>{selectedOrder.totalAmount} Frw</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </button>
          <button
            className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            onClick={() => {
              // Add print functionality or other actions
              window.print();
            }}
          >
            Print Order
          </button>
        </div>

      </div>
    </div>
  </div>
)}
</div>


  );
};

export default OrdersComponent;