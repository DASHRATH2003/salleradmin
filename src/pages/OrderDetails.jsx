import React, { useState, useEffect } from 'react'
import { Search, Filter, Eye, Download, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

const OrderDetails = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // Fetch orders from Firebase
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const ordersData = []
      
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setMessage('Error loading orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      })
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      setMessage('Order status updated successfully!')
    } catch (error) {
      console.error('Error updating order status:', error)
      setMessage('Error updating order status. Please try again.')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Click outside handler for suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('.search-container')) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSuggestions])

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // Generate suggestions for autocomplete
  const generateSuggestions = (searchValue) => {
    if (!searchValue.trim()) {
      setSuggestions([])
      return
    }

    const searchLower = searchValue.toLowerCase().trim()
    const suggestionSet = new Set()

    orders.forEach(order => {
      // Order ID suggestions
      if (order.id.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.id)
      }
      
      // Customer name suggestions
      if (order.customer?.name?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.customer.name)
      }
      
      // Customer email suggestions
      if (order.customer?.email?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.customer.email)
      }
      
      // Customer phone suggestions
      if (order.customer?.phone?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.customer.phone)
      }
      
      // Product name suggestions
      order.products?.forEach(product => {
        if (product.name?.toLowerCase().includes(searchLower)) {
          suggestionSet.add(product.name)
        }
        if (product.sku?.toLowerCase().includes(searchLower)) {
          suggestionSet.add(product.sku)
        }
      })
      
      // Shipping address suggestions
      if (order.shippingAddress?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.shippingAddress)
      }
      
      // Payment method suggestions
      if (order.paymentMethod?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(order.paymentMethod)
      }
    })

    setSuggestions(Array.from(suggestionSet).slice(0, 8))
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    generateSuggestions(value)
    setShowSuggestions(true)
    setSelectedSuggestionIndex(-1)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      order.customer?.email?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.toLowerCase().includes(searchLower) ||
      order.products?.some(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower)
      ) ||
      order.shippingAddress?.toLowerCase().includes(searchLower) ||
      order.paymentMethod?.toLowerCase().includes(searchLower)
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Order Details - {order.id}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getStatusColor(order.status)
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold mb-2 text-white">Customer Information</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300"><strong className="text-white">Name:</strong> {order.customer.name}</p>
                <p className="text-gray-300"><strong className="text-white">Email:</strong> {order.customer.email}</p>
                <p className="text-gray-300"><strong className="text-white">Phone:</strong> {order.customer.phone}</p>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold mb-2 text-white">Products</h3>
              <div className="border border-gray-600 rounded-lg">
                {order.products.map((product, index) => (
                  <div key={index} className="p-4 border-b border-gray-600 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-gray-300">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300">Qty: {product.quantity}</p>
                        <p className="font-medium text-white">₹{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-gray-700">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Total Amount:</span>
                    <span className="text-white">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="font-semibold mb-2 text-white">Shipping Information</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300"><strong className="text-white">Address:</strong> {order.shippingAddress}</p>
                <p className="text-gray-300"><strong className="text-white">Order Date:</strong> {order.orderDate}</p>
                {order.deliveryDate && (
                  <p className="text-gray-300"><strong className="text-white">Delivery Date:</strong> {order.deliveryDate}</p>
                )}
                {order.trackingNumber && (
                  <p className="text-gray-300"><strong className="text-white">Tracking Number:</strong> {order.trackingNumber}</p>
                )}
                <p className="text-gray-300"><strong className="text-white">Payment Method:</strong> {order.paymentMethod}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Update Status
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
        <p className="text-gray-300">Track and manage your customer orders</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Total Orders</h3>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Processing</h3>
          <p className="text-2xl font-bold text-blue-400">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Delivered</h3>
          <p className="text-2xl font-bold text-green-400">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, product, address..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 w-64"
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 cursor-pointer text-sm text-gray-300 hover:bg-gray-600 ${
                          index === selectedSuggestionIndex ? 'bg-gray-600' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
            <button className="flex items-center text-blue-400 hover:text-blue-300">
              <Download className="w-4 h-4 mr-1" />
              Export Orders
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{order.customer.name}</div>
                      <div className="text-sm text-gray-300">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.products.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.orderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(order.status)
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
        </>
      )}
    </div>
  )
}

export default OrderDetails