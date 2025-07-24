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
      
      // TODO: Backend endpoint needs to be created: /cart/getAllUserCarts
      // For now, using mock data to demonstrate the UI
      // This would be replaced with actual API call when the endpoint is available
      
      // Mock data for demonstration
      const mockCarts: UserCart[] = [
        {
          _id: '1',
          userId: 'user1',
          user: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            },
            image: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face']
          },
          items: [
            {
              productId: 'prod1',
              quantity: 2,
              price: 299.99,
              product: {
                _id: 'prod1',
                name: 'Premium Baby Crib',
                description: 'Safe and comfortable crib for your little one',
                price: 299.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            },
            {
              productId: 'prod2',
              quantity: 1,
              price: 89.99,
              product: {
                _id: 'prod2',
                name: 'Baby Changing Table',
                description: 'Convenient changing table with storage',
                price: 89.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            }
          ],
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          deliveryNotes: 'Please deliver between 9 AM - 5 PM. Ring doorbell twice.'
        },
        {
          _id: '2',
          userId: 'user2',
          user: {
            _id: 'user2',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com',
            phone: '987-654-3210',
            address: {
              street: '456 Oak Ave',
              city: 'Othertown',
              state: 'NY',
              zipCode: '67890',
              country: 'USA'
            },
            image: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face']
          },
          items: [
            {
              productId: 'prod3',
              quantity: 1,
              price: 159.99,
              product: {
                _id: 'prod3',
                name: 'Rocking Chair',
                description: 'Comfortable rocking chair for nursing',
                price: 159.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            }
          ],
          status: 'checkout',
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-15T09:20:00Z',
          deliveryNotes: 'Leave with doorman if not home. Building access code: 1234'
        },
        {
          _id: '3',
          userId: 'user3',
          user: {
            _id: 'user3',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@example.com',
            phone: '112-358-4697',
            address: {
              street: '789 Pine Ln',
              city: 'Smalltown',
              state: 'TX',
              zipCode: '12345',
              country: 'USA'
            },
            image: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face']
          },
          items: [
            {
              productId: 'prod4',
              quantity: 3,
              price: 45.99,
              product: {
                _id: 'prod4',
                name: 'Baby Clothes Set',
                description: 'Soft cotton baby clothes set',
                price: 45.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            },
            {
              productId: 'prod5',
              quantity: 1,
              price: 79.99,
              product: {
                _id: 'prod5',
                name: 'Baby Monitor',
                description: 'Digital baby monitor with night vision',
                price: 79.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            }
          ],
          status: 'completed',
          createdAt: '2024-01-13T08:15:00Z',
          updatedAt: '2024-01-14T16:30:00Z',
          deliveryNotes: 'Delivered successfully on 2024-01-14. Customer was home.'
        },
        {
          _id: '4',
          userId: 'user4',
          user: {
            _id: 'user4',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            phone: '555-123-4567',
            address: {
              street: '101 Cedar St',
              city: 'Bigtown',
              state: 'FL',
              zipCode: '98765',
              country: 'USA'
            },
            image: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face']
          },
          items: [
            {
              productId: 'prod6',
              quantity: 1,
              price: 199.99,
              product: {
                _id: 'prod6',
                name: 'Baby Stroller',
                description: 'Lightweight and foldable baby stroller',
                price: 199.99,
                image: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop']
              }
            }
          ],
          status: 'abandoned',
          createdAt: '2024-01-12T11:20:00Z',
          updatedAt: '2024-01-12T14:45:00Z',
          deliveryNotes: 'Cart abandoned - customer may return later'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserCarts(mockCarts);
      console.log('Loaded mock cart data for demonstration');
      
    } catch (error) {
      console.error('Error loading cart data:', error);
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
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <th className="px-6 py-3 font-semibold">Customer Info</th>
                  <th className="px-6 py-3 font-semibold">Delivery Address</th>
                  <th className="px-6 py-3 font-semibold">Cart Items</th>
                  <th className="px-6 py-3 font-semibold">Total Value</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Delivery Notes</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
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
                      {cart.user?.address ? (
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{cart.user.address.street}</div>
                          <div className="text-gray-700">
                            {cart.user.address.city}, {cart.user.address.state} {cart.user.address.zipCode}
                          </div>
                          <div className="text-gray-600">{cart.user.address.country}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No address provided</div>
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