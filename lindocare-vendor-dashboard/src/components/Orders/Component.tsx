'use client';

import React, { useState, useEffect } from 'react';
import { Package, Eye, X, MapPin, Calendar, CreditCard } from 'lucide-react';

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
}

interface ShippingAddress {
  province: string;
  district: string;
  sector?: string;
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
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

const OrdersComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
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
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`https://lindo-project.onrender.com/orders/updateOrderStatus/${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        setSuccessMessage('Order status updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'processing': return 'bg-blue-50 text-blue-700';
      case 'shipped': return 'bg-purple-50 text-purple-700';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedStatus);

  const normalizeImageUrl = (url: any) => {
    if (!url) return '';
    
    // Handle array of images
    if (Array.isArray(url)) {
      url = url[0];
      if (!url) return '';
    }
    
    // Handle object with url property
    if (typeof url === 'object' && url.url) {
      url = url.url;
    }
    
    // Convert to string if not already
    const urlString = typeof url === 'string' ? url : String(url);
    if (!urlString || urlString === 'undefined' || urlString === 'null') return '';
    
    return urlString.startsWith('http') ? urlString : `https://lindo-project.onrender.com/${urlString}`;
  };

    return (
        <div className="space-y-6">
          {/* Header */}
      <div className="flex items-center justify-between">
              <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
            </div>
          </div>

      {/* Success Message */}
          {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
            </div>
          )}

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
              </div>

      {/* Orders List */}
        {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No orders found</p>
          </div>
        ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">Order #{order._id ? order._id.slice(-8) : 'N/A'}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                              </span>
                            </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    <div className="flex items-center gap-1">
                      <CreditCard size={14} />
                      {order.paymentMethod || 'N/A'}
                          </div>
                        </div>
                      </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    RWF {(order.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                      </div>
                      </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{order.shippingAddress?.province || 'N/A'}, {order.shippingAddress?.district || 'N/A'}</span>
                      </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                          <Eye size={14} /> 
                    View
                        </button>
                        <select
                          value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
              </div>
            </div>
                ))}
          </div>
        )}

          {/* Order Details Modal */}
          {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
        </button>
      </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder._id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
              </div>
              <div>
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
                  {selectedOrder.shippingAddress?.customerName && (
                    <p><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.customerName}</p>
                  )}
                  {selectedOrder.shippingAddress?.customerPhone && (
                    <p><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.customerPhone}</p>
                  )}
                  <p>
                    <span className="font-medium">Location:</span> {selectedOrder.shippingAddress?.province || 'N/A'}, {selectedOrder.shippingAddress?.district || 'N/A'}
                    {selectedOrder.shippingAddress?.sector && `, ${selectedOrder.shippingAddress.sector}`}
                  </p>
          </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => {
                    const product = typeof item.product === 'object' ? item.product : null;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {product?.image && product.image[0] ? (
                          <img
                            src={normalizeImageUrl(product.image[0])}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
              </div>
            )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity || 0} × RWF {(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          RWF {((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    RWF {(selectedOrder.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersComponent;
