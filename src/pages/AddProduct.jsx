import React, { useState } from 'react'
import { Plus, X, Upload, Save } from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const AddProduct = () => {
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newSpec, setNewSpec] = useState({ key: '', value: '' })
  const [newTag, setNewTag] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    comparePrice: '',
    sku: '',
    stock: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    specifications: [],
    tags: [],
    images: []
  })

  const categories = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories'],
    'Clothing': ['Men', 'Women', 'Kids', 'Accessories'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden'],
    'Sports': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports']
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, event.target.result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, newSpec]
      }))
      setNewSpec({ key: '', value: '' })
    }
  }

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    // Form validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' })
      setIsLoading(false)
      return
    }
    
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Category is required' })
      setIsLoading(false)
      return
    }
    
    if (!formData.subcategory) {
      setMessage({ type: 'error', text: 'Subcategory is required' })
      setIsLoading(false)
      return
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'Valid price is required' })
      setIsLoading(false)
      return
    }
    
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      setMessage({ type: 'error', text: 'Valid stock quantity is required' })
      setIsLoading(false)
      return
    }

    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log('Adding product to Firebase:', productData)
      await addDoc(collection(db, 'products'), productData)
      setMessage({ type: 'success', text: 'Product added successfully!' })
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        price: '',
        comparePrice: '',
        sku: '',
        stock: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        specifications: [],
        tags: [],
        images: []
      })
    } catch (error) {
      console.error('Error adding product:', error)
      
      // More specific error messages
      let errorMessage = 'Failed to add product. Please try again.'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firebase security rules.'
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service unavailable. Please check your internet connection.'
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check your input.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header with Add Product Button */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Products</h1>
              <p className="text-gray-300 mt-1">Manage your product inventory and listings</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!showForm && (
          <div className="px-6 py-8">
            <div className="text-center text-gray-400">
              <p>No products found. Click "Add Product" to create your first product.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay - Show when form is active */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-blue-400">ADD PRODUCT</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-700' 
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Form */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload Product Image */}
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-700">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">Upload Product Image</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block transition-colors mt-2 text-sm"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Product Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="Product Name"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Sub Category</option>
                    {formData.category && categories[formData.category]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>

                {/* Product Attributes */}
                <div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="Enter product attributes"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-500"
                    placeholder="Price (₹)"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                {/* Offer Price */}
                <div>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-500"
                    placeholder="Offer Price (₹)"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Brand */}
                <div>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-500"
                    placeholder="Brand"
                  />
                </div>

                {/* Stock */}
                <div>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-500"
                    placeholder="Stock Quantity"
                    min="0"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoading ? 'Adding Product...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddProduct