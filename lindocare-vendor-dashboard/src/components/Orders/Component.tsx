'use client';

import React, { useState, useEffect } from 'react';
import { Package, User, CreditCard, MapPin, Calendar, Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string[];
  };
}

interface Order {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string[];
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'pesapal' | string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string[];
}

const OrdersComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  function getAccessToken(): string | null {
    // Use the exact pattern provided: read userData, parse, and access tokens.accessToken
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const openLock: string | null = parsed?.user?.tokens?.accessToken || null;
      if (openLock) {
        console.log('Access token (openLock) present');
      }
      return openLock;
    } catch {
      return null;
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Try primary endpoint
      let response = await fetch('https://lindo-project.onrender.com/orders/getAllOrders', { headers });

      // Fallback if 404
      if (response.status === 404) {
        response = await fetch('https://lindo-project.onrender.com/orders/allOrders', { headers });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched orders:', data);
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
        setErrorMessage('');
      } else if (response.status === 401) {
        setErrorMessage('Authentication required. Please log in.');
        setOrders([]);
      } else {
        console.error('Error fetching orders:', response.status, response.statusText);
        setOrders([]);
        setErrorMessage('Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setErrorMessage('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://lindo-project.onrender.com/product/getAllProduct');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const getProductById = (productId: string) => {
    return products.find(product => product._id === productId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      case 'pending':
        return <Package size={16} className="text-orange-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'cash':
        return <span className="text-green-600 font-bold">$</span>;
      case 'mobile_money':
        return <span className="text-purple-600 font-bold">M</span>;
      case 'pesapal':
        return <CreditCard size={16} className="text-blue-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const formatShippingAddress = (addr: any) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const { province, district, sector, cell, village, street } = addr || {};
    return [province, district, sector, cell, village, street].filter(Boolean).join(', ');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`https://lindo-project.onrender.com/orders/updateOrderStatus/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccessMessage('Order status updated successfully!');
        fetchOrders();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus;
    const paymentMatch = selectedPaymentMethod === 'all' || order.paymentMethod === selectedPaymentMethod;
    return statusMatch && paymentMatch;
  });

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const processing = orders.filter(order => order.status === 'processing').length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return { total, pending, processing, shipped, delivered, cancelled, totalRevenue };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Package size={16} />
            <span>{stats.total} total orders</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={16} />
            <span>Revenue: ${stats.totalRevenue.toFixed(2)}</span>
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
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock size={18} className="text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Pending</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-orange-600">{stats.pending}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock size={18} className="text-yellow-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Processing</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-yellow-600">{stats.processing}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck size={18} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Shipped</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-blue-600">{stats.shipped}</td>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <label className="text-sm font-medium text-gray-700 ml-4">Payment Method:</label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="pesapal">Pesapal</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Orders</h2>
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
            <table className="min-w-full text-sm text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Order Items</th>
                  <th className="px-6 py-3 font-semibold">Total Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Shipping</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-cyan-50'}`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {order.user?.image && order.user.image.length > 0 ? (
                            <img
                              src={order.user.image[0]}
                              alt={`${order.user.firstName} ${order.user.lastName}`}
                              className="h-8 w-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {order.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-gray-700">{order.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="text-gray-900 font-semibold">{order.items.length} items</div>
                      <div className="text-gray-700 max-w-xs truncate">
                        {order.items.slice(0, 2).map(item => {
                          const product = getProductById(item.productId);
                          return product?.name || `Product ${item.productId.slice(-8)}`;
                        }).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-semibold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span className="text-gray-900 capitalize">
                          {String(order.paymentMethod || '').replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-gray-700 max-w-xs truncate">
                          {formatShippingAddress(order.shippingAddress)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1"
                          title="View Order Details"
                        >
                          <Eye size={12} /> View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
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
    </div>
  );
};

export default OrdersComponent; 