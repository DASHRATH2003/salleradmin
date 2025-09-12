import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { collection, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore'
import { db, auth } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'


const SellerProducts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentSellerId, setCurrentSellerId] = useState(null)
  const [sellerName, setSellerName] = useState('')

  // Fetch products from Firebase
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const q = query(collection(db, 'products'))
      const querySnapshot = await getDocs(q)
      const productsData = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        productsData.push({
          id: doc.id,
          ...data,
          sales: data.sales || Math.floor(Math.random() * 100)
        })
      })
      
      // Sort by createdAt in JavaScript instead of Firestore
      productsData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.createdAt?.toDate?.() || new Date(0)
        return bTime - aTime
      })
      
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
      setMessage(`Error loading products: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch current seller info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentSellerId(user.uid)
        // Fetch seller name from Firestore
        try {
          const sellerDoc = await getDocs(query(collection(db, 'sellers'), where('sellerId', '==', user.uid)))
          if (!sellerDoc.empty) {
            const sellerData = sellerDoc.docs[0].data()
            setSellerName(`${sellerData.firstName} ${sellerData.lastName}`)
          }
        } catch (error) {
          console.error('Error fetching seller data:', error)
        }
      }
    })
    
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-300'
      case 'inactive': return 'bg-gray-700 text-gray-300'
      case 'out_of_stock': return 'bg-red-900 text-red-300'
      default: return 'bg-gray-700 text-gray-300'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'out_of_stock': return 'Out of Stock'
      default: return 'Unknown'
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId))
        setProducts(products.filter(p => p.id !== productId))
        setMessage('Product deleted successfully!')
      } catch (error) {
        console.error('Error deleting product:', error)
        setMessage('Error deleting product. Please try again.')
      }
    }
  }



  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Products</h1>
          <p className="text-gray-300">Manage your product inventory and listings</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/add-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-300">Loading products...</div>
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Total Products</h3>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Active Products</h3>
          <p className="text-2xl font-bold text-green-400">
            {products.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-400">
            {products.filter(p => p.status === 'out_of_stock').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-400">
            {products.reduce((sum, p) => sum + p.sales, 0)}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sub Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">IMG</span>
                        )}
                        <span className="text-gray-300 text-xs hidden">IMG</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.subcategory || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    ₹{product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <span className="text-gray-300 text-xs">IMG</span>
                  )}
                  <span className="text-gray-300 text-xs hidden">IMG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{product.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-300">{product.category}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Sub Category:</span>
                      <span className="text-gray-300">{product.subcategory || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-gray-300 font-medium">₹{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-3">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-400 hover:text-green-300 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default SellerProducts