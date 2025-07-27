'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Package, CheckCircle, Clock, Eye } from 'lucide-react';

interface CartItem {
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

interface UserCart {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    image?: string[];
  };
  items: CartItem[];
  status: 'pending' | 'checkout' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  shippingAddress?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string[];
}

const CartComponent: React.FC = () => {
  const [userCarts, setUserCarts] = useState<UserCart[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchUserCarts();
    fetchProducts();
  }, []);

  const fetchUserCarts = async () => {
    try {
      setLoading(true);
      
      // Fetch real orders from the backend
      const response = await fetch('https://lindo-project.onrender.com/orders/getAllOrders', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const ordersData = await response.json();
      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      
      // Transform orders to match UserCart interface
      const transformedCarts: UserCart[] = orders.map((order: any) => ({
        _id: order._id || order.id,
        userId: order.userId || order.user?._id || 'unknown',
        user: {
          _id: order.user?._id || order.userId || 'unknown',
          firstName: order.user?.firstName || order.user?.name?.split(' ')[0] || 'Unknown',
          lastName: order.user?.lastName || order.user?.name?.split(' ').slice(1).join(' ') || 'User',
          email: order.user?.email || 'unknown@example.com',
          phone: order.user?.phone || '',
          address: {
            street: order.shippingAddress || '',
            city: 'Kigali',
            state: 'Kigali',
            zipCode: '00000',
            country: 'Rwanda'
          },
          image: order.user?.image || []
        },
        items: order.items?.map((item: any) => ({
          productId: item.productId || item._id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          product: {
            _id: item.productId || item._id,
            name: item.product?.name || 'Product',
            description: item.product?.description || '',
            price: item.price || 0,
            image: item.product?.image || []
          }
        })) || [],
        status: order.status || 'pending',
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt || new Date().toISOString(),
        deliveryNotes: order.deliveryNotes || '',
        paymentMethod: order.paymentMethod || 'cash',
        shippingAddress: order.shippingAddress || ''
      }));
      
      setUserCarts(transformedCarts);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Failed to fetch orders. Please try again.');
      // Fallback to mock data if API fails
      setUserCarts([]);
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

  const calculateCartTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product?.price || item.price) * item.quantity;
    }, 0);
  };

  const getTotalItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'checkout':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'checkout':
        return <ShoppingCart size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'abandoned':
        return <Package size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const filteredCarts = selectedStatus === 'all' 
    ? userCarts 
    : userCarts.filter(cart => cart.status === selectedStatus);

  const getStats = () => {
    const total = userCarts.length;
    const pending = userCarts.filter(cart => cart.status === 'pending').length;
    const checkout = userCarts.filter(cart => cart.status === 'checkout').length;
    const completed = userCarts.filter(cart => cart.status === 'completed').length;
    const abandoned = userCarts.filter(cart => cart.status === 'abandoned').length;

    return { total, pending, checkout, completed, abandoned };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Cart Management</h1>
          <p className="text-gray-600 mt-1">Monitor customer cart activities and checkout status</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Currently using mock data. Backend endpoint <code>/cart/getAllUserCarts</code> needs to be implemented for production use.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{stats.total} total carts</span>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cart Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-6 py-3 font-semibold">Metric</th>
                <th className="px-6 py-3 font-semibold text-center">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart size={18} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Total Carts</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-blue-600">{stats.total}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock size={18} className="text-yellow-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Pending</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-yellow-600">{stats.pending}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart size={18} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">In Checkout</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-blue-600">{stats.checkout}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Completed</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-green-600">{stats.completed}</td>
              </tr>
              <tr className="even:bg-gray-50 hover:bg-gray-100 transition">
                <td className="px-6 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Package size={18} className="text-red-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Abandoned</span>
                  </div>
                </td>
                <td className="px-6 py-3 align-middle text-center font-bold text-xl text-red-600">{stats.abandoned}</td>
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

      {/* Filter */}
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
            <option value="checkout">In Checkout</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Customer Carts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Cart Activities</h2>
        </div>
        
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Loading customer carts...
          </div>
        ) : filteredCarts.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No customer carts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-3 font-semibold text-left">Customer</th>
                  <th className="px-6 py-3 font-semibold text-left">Shipping Address</th>
                  <th className="px-6 py-3 font-semibold text-left">Items</th>
                  <th className="px-6 py-3 font-semibold text-center">Total</th>
                  <th className="px-6 py-3 font-semibold text-center">Payment Method</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-left">Delivery Notes</th>
                  <th className="px-6 py-3 font-semibold text-center">Date</th>
                  <th className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCarts.map((cart, index) => (
                  <tr key={cart._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {cart.user?.image && cart.user.image.length > 0 ? (
                            <img
                              src={cart.user.image[0]}
                              alt={`${cart.user.firstName} ${cart.user.lastName}`}
                              className="h-8 w-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {cart.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">
                            {cart.user?.firstName} {cart.user?.lastName}
                          </div>
                          <div className="text-gray-700 text-xs">{cart.user?.email}</div>
                          <div className="text-gray-600 text-xs">{cart.user?.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {cart.shippingAddress ? (
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{cart.shippingAddress}</div>
                          <div className="text-gray-700">Kigali, Rwanda</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No shipping address</div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="text-gray-900 font-semibold">{getTotalItems(cart.items)} items</div>
                      <div className="text-gray-700 max-w-xs truncate">
                        {cart.items.slice(0, 2).map(item => {
                          const product = getProductById(item.productId);
                          return product?.name || `Product ${item.productId.slice(-8)}`;
                        }).join(', ')}
                        {cart.items.length > 2 && ` +${cart.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-semibold text-gray-900">
                      ${calculateCartTotal(cart.items).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="text-xs">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cart.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                          cart.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cart.paymentMethod?.toUpperCase() || 'CASH'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cart.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(cart.status)}`}>
                          {cart.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="text-xs text-gray-700 max-w-xs">
                        {cart.deliveryNotes ? (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            {cart.deliveryNotes}
                          </div>
                        ) : (
                          <span className="text-gray-500">No delivery notes</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-gray-700">
                      {new Date(cart.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1 mx-auto"
                        title="View Cart Details"
                      >
                        <Eye size={12} /> View
                      </button>
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

export default CartComponent; 