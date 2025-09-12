import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, ArrowRight, ArrowLeft, XCircle, AlertCircle } from 'lucide-react'
import { useSellerContext } from '../context/SellerContext'
import { storage, db, auth } from '../config/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'

const SellerDocuments = () => {
  const navigate = useNavigate()
  const { dispatch } = useSellerContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedDocs, setUploadedDocs] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})
  const [isUploading, setIsUploading] = useState(false)

  const documentSteps = [
    {
      id: 'identity',
      title: 'Identity Proof',
      description: 'Upload your Aadhaar Card, PAN Card, or Passport',
      formats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'business',
      title: 'Business Proof',
      description: 'Upload GST Certificate or Business Registration',
      formats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'bank',
      title: 'Bank Details',
      description: 'Upload Cancelled Cheque or Bank Statement',
      formats: 'PDF, JPG, PNG (Max 5MB)'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleFileUpload = async (categoryId, file) => {
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF, JPG, or PNG files')
      return
    }

    if (!auth.currentUser) {
      alert('Please login first')
      return
    }

    setIsUploading(true)
    setUploadProgress(prev => ({ ...prev, [categoryId]: 0 }))

    try {
      const sellerId = auth.currentUser.uid
      const storageRef = ref(storage, `seller-documents/${sellerId}/${categoryId}_${Date.now()}_${file.name}`)
      
      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(prev => ({ ...prev, [categoryId]: Math.round(progress) }))
        },
        (error) => {
          console.error('Upload error:', error)
          alert('Upload failed. Please try again.')
          setIsUploading(false)
          setUploadProgress(prev => ({ ...prev, [categoryId]: 0 }))
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            const documentData = {
              fileUrl: downloadURL
            }
            
            // Update uploaded docs state
            setUploadedDocs(prev => ({
              ...prev,
              [categoryId]: documentData
            }))
            
            // Update seller document status in Firestore
            const sellerDocRef = doc(db, 'sellers', sellerId)
            await updateDoc(sellerDocRef, {
              [`documents.${categoryId}`]: documentData,
              [`verificationStatus.${categoryId}`]: 'uploaded'
            })
            
            setUploadProgress(prev => ({ ...prev, [categoryId]: 0 }))
            alert('Document uploaded successfully!')
            
          } catch (error) {
            console.error('Error saving document data:', error)
            alert('Upload completed but failed to save document data. Please try again.')
          }
        }
      )
      alert('Document uploaded successfully! It will be reviewed within 24-48 hours.')

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setUploadedDocs(prev => {
        const newDocs = { ...prev }
        delete newDocs[categoryId]
        return newDocs
      })
    }
  }

  const handleViewDocument = (fileUrl) => {
    window.open(fileUrl, '_blank')
  }

  const handleNext = () => {
    if (currentStep < documentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitForVerification = async () => {
    const allDocsUploaded = documentSteps.every(step => uploadedDocs[step.id])

    if (!allDocsUploaded) {
      alert('Please upload all required documents before submitting for verification.')
      return
    }

    if (!auth.currentUser) {
      alert('Please login first')
      return
    }

    if (window.confirm('Are you sure you want to submit all documents for verification?')) {
      try {
        const sellerId = auth.currentUser.uid
        
        const sellerDocRef = doc(db, 'sellers', sellerId)
        await updateDoc(sellerDocRef, {
          documentsUploaded: true,
          documentsSubmittedAt: new Date().toISOString(),
          status: 'pending'
        })
        
        dispatch({
          type: 'UPLOAD_DOCUMENTS',
          payload: uploadedDocs
        })
        
        alert('Documents submitted successfully! Review will be completed within 24-48 hours.')
        navigate('/seller/login')
        
      } catch (error) {
        console.error('Error submitting documents:', error)
        alert('Failed to submit documents. Please try again.')
      }
    }
  }

  const getOverallProgress = () => {
    const uploadedCount = documentSteps.filter(step => uploadedDocs[step.id]).length
    return Math.round((uploadedCount / documentSteps.length) * 100)
  }

  const currentStepData = documentSteps[currentStep]

  return (
    <div className="min-h-screen bg-gray-500 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-300 shadow-xl rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Document Verification</h1>
                <p className="text-blue-100">Step {currentStep + 1} of {documentSteps.length}</p>
              </div>
              <div className="text-white text-right">
                <div className="text-2xl font-bold">{getOverallProgress()}%</div>
                <div className="text-sm">Complete</div>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                {documentSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500/30 text-white'
                    }`}>
                      {uploadedDocs[step.id] ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < documentSteps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < currentStep ? 'bg-white' : 'bg-blue-500/30'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-gray-100 shadow-xl rounded-2xl overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-1">{currentStepData.description}</p>
                <p className="text-sm text-gray-500 mt-1">{currentStepData.formats}</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {(() => {
              const uploadedDoc = uploadedDocs[currentStepData.id]
              const progress = uploadProgress[currentStepData.id]

              return (
                <div>
                  {/* Upload Area or Uploaded Document */}
                  {!uploadedDoc ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-gray-500 hover:bg-gray-50 transition-all duration-300 group bg-gray-100">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-lg font-semibold text-gray-900 block mb-2">
                            Click to upload your document
                          </span>
                          <span className="text-sm text-gray-600">
                            Choose a clear, readable document file
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(currentStepData.id, e.target.files[0])}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      
                      {/* Upload Progress */}
                      {progress > 0 && (
                        <div className="mt-8">
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-lg font-medium text-blue-600 mt-3">Uploading... {progress}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-2xl p-8 border border-gray-300">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">Document Uploaded</p>
                          <p className="text-gray-600 mb-4">
                            Uploaded successfully
                          </p>
                          <button
                            onClick={() => handleViewDocument(uploadedDoc.fileUrl)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          {currentStep < documentSteps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!uploadedDocs[currentStepData.id]}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmitForVerification}
              disabled={getOverallProgress() < 100}
              className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Submit for Verification
            </button>
          )}
        </div>


      </div>
    </div>
  )
}

export default SellerDocuments