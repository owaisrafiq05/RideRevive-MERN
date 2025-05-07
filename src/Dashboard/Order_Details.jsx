"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import {
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react"

const Order_Details = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/orders/${orderId}`)
      if (response.data.success) {
        setOrder(response.data.data)
        setNewStatus(response.data.data.status)
        setAdminNotes(response.data.data.adminNotes || "")
      } else {
        toast.error("Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast.error("Something went wrong while fetching order details")
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (newStatus === order.status) return

    setIsUpdating(true)
    try {
      const response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/orders/${orderId}/status`, {
        status: newStatus
      })
      
      if (response.data.success) {
        toast.success("Order status updated successfully")
        fetchOrderDetails()
      } else {
        toast.error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Something went wrong while updating order status")
    } finally {
      setIsUpdating(false)
    }
  }

  const saveAdminNotes = async () => {
    setIsSavingNotes(true)
    try {
      const response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/orders/${orderId}/notes`, {
        adminNotes: adminNotes
      })
      
      if (response.data.success) {
        toast.success("Admin notes saved successfully")
      } else {
        toast.error("Failed to save admin notes")
      }
    } catch (error) {
      console.error("Error saving admin notes:", error)
      toast.error("Something went wrong while saving admin notes")
    } finally {
      setIsSavingNotes(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green"
      case "in-progress":
        return "blue"
      case "pending":
        return "amber"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-400" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-400" />
      case "cancelled":
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800 p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/admin/orders")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/orders")}
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Order{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    #{order._id.substring(0, 8)}
                  </span>
                </h1>
                <p className="text-gray-400">Created on {formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isUpdating}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg block w-full p-2.5 appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                onClick={updateOrderStatus}
                disabled={isUpdating || newStatus === order.status}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isUpdating || newStatus === order.status
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                }`}
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`mb-8 rounded-xl p-4 flex items-center gap-3 bg-${getStatusColor(
            order.status
          )}-600/20 border border-${getStatusColor(order.status)}-600/30`}
        >
          {getStatusIcon(order.status)}
          <div>
            <h3 className={`font-medium text-${getStatusColor(order.status)}-400`}>
              Order is currently {order.status}
            </h3>
            <p className="text-sm text-gray-400">
              {order.status === "pending"
                ? "This order is waiting for approval"
                : order.status === "approved"
                ? "This order has been approved and is ready to be processed"
                : order.status === "in-progress"
                ? "This order is currently being processed"
                : order.status === "completed"
                ? "This order has been successfully completed"
                : order.status === "cancelled"
                ? "This order has been cancelled by the customer"
                : "This order has been rejected"}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Order Information</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3 mb-6">
                      <Calendar className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Scheduled Date</h3>
                        <p className="text-gray-400">{formatDate(order.scheduledDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mb-6">
                      <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Scheduled Time</h3>
                        <p className="text-gray-400">{formatTime(order.scheduledDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Payment Information</h3>
                        <p className="text-gray-400">
                          <span className="capitalize">{order.paymentMethod?.replace("_", " ")}</span>
                          {" - "}
                          <span
                            className={
                              order.paymentStatus === "paid" ? "text-green-400" : "text-amber-400"
                            }
                          >
                            {order.paymentStatus}
                          </span>
                        </p>
                        {order.paymentDetails?.transactionId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Transaction ID: {order.paymentDetails.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3 mb-6">
                      <User className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Customer Information</h3>
                        <p className="text-gray-400">{order.user?.name || "Unknown"}</p>
                        <p className="text-gray-400">{order.user?.email || "No email provided"}</p>
                        <p className="text-gray-400">{order.user?.phone || "No phone provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Delivery Address</h3>
                        <p className="text-gray-400">{order.address?.fullAddress || "No address provided"}</p>
                        {order.address?.coordinates && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coords: {order.address.coordinates.lat.toFixed(6)}, {order.address.coordinates.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Vehicle Information</h3>
                        <p className="text-gray-400">
                          {order.car?.year} {order.car?.make} {order.car?.model}
                        </p>
                        <p className="text-gray-400">
                          Color: {order.car?.color || "Not specified"}
                        </p>
                        <p className="text-gray-400">
                          License Plate: {order.car?.licensePlate || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Special Instructions</h3>
                        <p className="text-gray-400">{order.specialInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services & Items */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Services & Items</h2>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-800">
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.services.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-4 text-white font-medium">
                            {item.serviceName || item.service?.name || "Unknown Service"}
                          </td>
                          <td className="py-4 text-gray-400">
                            {item.service?.description || "No description available"}
                          </td>
                          <td className="py-4 text-white font-medium text-right">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="py-4 text-white font-medium text-right">
                          Total Amount:
                        </td>
                        <td className="py-4 text-white font-bold text-right">${order.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Service Details */}
            {order.services.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white">
                    {item.serviceName || item.service?.name || "Unknown Service"} Details
                  </h2>
                </div>
                <div className="p-6">
                  {item.serviceDetails ? (
                    <div className="space-y-4">
                      {/* Car Washing Service */}
                      {item.serviceName?.toLowerCase().includes('car wash') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-white font-medium mb-3">Service Information</h3>
                            <ul className="space-y-2 text-gray-300">
                              <li className="flex justify-between">
                                <span className="text-gray-400">Service Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.serviceType}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-400">Vehicle Size:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.vehicleSize}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-400">Booking Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.bookingType}</span>
                              </li>
                              {item.serviceDetails.bookingType === "scheduled" && item.serviceDetails.scheduledInfo && (
                                <li className="flex justify-between">
                                  <span className="text-gray-400">Schedule:</span>
                                  <span className="font-medium text-white">
                                    {item.serviceDetails.scheduledInfo.date} at {item.serviceDetails.scheduledInfo.time}
                                  </span>
                                </li>
                              )}
                              <li className="flex justify-between">
                                <span className="text-gray-400">Est. Duration:</span>
                                <span className="font-medium text-white">{item.serviceDetails.estimatedDuration} minutes</span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-white font-medium mb-3">Pricing Information</h3>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Estimated Price:</span>
                                <span className="font-medium text-white">${item.serviceDetails.estimatedPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Final Price:</span>
                                <span className="font-medium text-white">${item.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Engine Oil Service */}
                      {item.serviceName?.toLowerCase().includes('oil') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-white font-medium mb-3">Service Information</h3>
                            <ul className="space-y-2 text-gray-300">
                              <li className="flex justify-between">
                                <span className="text-gray-400">Service Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.serviceType}</span>
                              </li>
                              {item.serviceDetails.oilType && (
                                <li className="flex justify-between">
                                  <span className="text-gray-400">Oil Type:</span>
                                  <span className="font-medium text-white capitalize">{item.serviceDetails.oilType}</span>
                                </li>
                              )}
                              <li className="flex justify-between">
                                <span className="text-gray-400">Vehicle Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.vehicleType}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-400">Booking Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.bookingType}</span>
                              </li>
                              {item.serviceDetails.bookingType === "scheduled" && item.serviceDetails.scheduledInfo && (
                                <li className="flex justify-between">
                                  <span className="text-gray-400">Schedule:</span>
                                  <span className="font-medium text-white">
                                    {item.serviceDetails.scheduledInfo.date} at {item.serviceDetails.scheduledInfo.time}
                                  </span>
                                </li>
                              )}
                              {item.serviceDetails.additionalServices && (
                                <li>
                                  <span className="text-gray-400 block mb-1">Additional Services:</span>
                                  <ul className="ml-4 space-y-1">
                                    {item.serviceDetails.additionalServices.filterChange && (
                                      <li className="text-green-400">✓ Oil Filter Change</li>
                                    )}
                                    {item.serviceDetails.additionalServices.fluidCheck && (
                                      <li className="text-green-400">✓ Fluid Check & Top-up</li>
                                    )}
                                    {!item.serviceDetails.additionalServices.filterChange && !item.serviceDetails.additionalServices.fluidCheck && (
                                      <li className="text-gray-400">No additional services</li>
                                    )}
                                  </ul>
                                </li>
                              )}
                              <li className="flex justify-between">
                                <span className="text-gray-400">Est. Duration:</span>
                                <span className="font-medium text-white">{item.serviceDetails.estimatedDuration} minutes</span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-white font-medium mb-3">Pricing Information</h3>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Estimated Price:</span>
                                <span className="font-medium text-white">${item.serviceDetails.estimatedPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Final Price:</span>
                                <span className="font-medium text-white">${item.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Rescue Service */}
                      {(item.serviceName?.toLowerCase().includes('emergency') || item.serviceName?.toLowerCase().includes('rescue')) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-white font-medium mb-3">Emergency Information</h3>
                            <ul className="space-y-2 text-gray-300">
                              <li className="flex justify-between">
                                <span className="text-gray-400">Service Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.serviceType}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-400">Vehicle Type:</span>
                                <span className="font-medium text-white capitalize">{item.serviceDetails.vehicleType}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-400">Vehicle Accessible:</span>
                                <span className="font-medium text-white">{item.serviceDetails.isVehicleAccessible === "yes" ? "Yes" : "No, difficult location"}</span>
                              </li>
                              {item.serviceDetails.emergencyInfo && (
                                <>
                                  <li className="flex justify-between">
                                    <span className="text-gray-400">Est. Response Time:</span>
                                    <span className="font-medium text-white">{item.serviceDetails.emergencyInfo.estimatedResponse} minutes</span>
                                  </li>
                                  {item.serviceDetails.emergencyInfo.description && (
                                    <li>
                                      <span className="text-gray-400 block mb-1">Emergency Description:</span>
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 mt-1">
                                        <p className="text-white text-sm">{item.serviceDetails.emergencyInfo.description}</p>
                                      </div>
                                    </li>
                                  )}
                                </>
                              )}
                              {item.serviceDetails.contactInfo && (
                                <>
                                  <li className="flex justify-between">
                                    <span className="text-gray-400">Contact Name:</span>
                                    <span className="font-medium text-white">{item.serviceDetails.contactInfo.name}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span className="text-gray-400">Contact Phone:</span>
                                    <span className="font-medium text-white">{item.serviceDetails.contactInfo.phone}</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-white font-medium mb-3">Pricing Information</h3>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Estimated Price:</span>
                                <span className="font-medium text-white">${item.serviceDetails.estimatedPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Final Price:</span>
                                <span className="font-medium text-white">${item.price}</span>
                              </div>
                            </div>
                            <div className="mt-4 p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                              <p className="text-sm text-red-300 font-medium">This is an emergency service request.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Default case if service type is not recognized */}
                      {!item.serviceName?.toLowerCase().includes('car wash') && 
                       !item.serviceName?.toLowerCase().includes('oil') && 
                       !item.serviceName?.toLowerCase().includes('emergency') && 
                       !item.serviceName?.toLowerCase().includes('rescue') && (
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <pre className="text-white text-sm overflow-auto">
                            {JSON.stringify(item.serviceDetails, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-600/10 border border-amber-500/30 rounded-lg p-4">
                      <p className="text-amber-300 text-sm">No detailed service information available for this order.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Admin Notes */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Admin Notes</h2>
              </div>

              <div className="p-6">
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  rows="4"
                  placeholder="Add admin notes here..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={saveAdminNotes}
                    disabled={isSavingNotes}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isSavingNotes
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                    }`}
                  >
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                    <Edit className="h-5 w-5" />
                    Edit Order Details
                  </button>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
                    <User className="h-5 w-5" />
                    Contact Customer
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                    <Trash2 className="h-5 w-5" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Order Timeline</h2>
              </div>

              <div className="p-6">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-blue-500 before:to-gray-700 before:bg-gray-700">
                  <div className="relative flex items-start group">
                    <span className="absolute top-0 left-0 mt-1 h-9 w-9 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    <div className="ml-12">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1">
                        <h3 className="text-white font-medium">Order Created</h3>
                        <time className="text-xs text-gray-400">
                          {formatDate(order.createdAt)} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-gray-400">Order was created by {order.user?.name || "customer"}</p>
                    </div>
                  </div>

                  {/* We can add more timeline events based on status changes or other events */}
                  {order.status !== "pending" && (
                    <div className="relative flex items-start group">
                      <span className="absolute top-0 left-0 mt-1 h-9 w-9 rounded-full flex items-center justify-center bg-amber-600 text-white shadow-lg shadow-amber-600/20">
                        <Clock className="h-5 w-5" />
                      </span>
                      <div className="ml-12">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1">
                          <h3 className="text-white font-medium">Status Updated</h3>
                          <time className="text-xs text-gray-400">
                            {formatDate(order.updatedAt)} at{" "}
                            {new Date(order.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                        <p className="text-sm text-gray-400">
                          Order status changed to <span className="capitalize">{order.status}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="relative flex items-start group">
                      <span className="absolute top-0 left-0 mt-1 h-9 w-9 rounded-full flex items-center justify-center bg-green-600 text-white shadow-lg shadow-green-600/20">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <div className="ml-12">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1">
                          <h3 className="text-white font-medium">Order Completed</h3>
                          <time className="text-xs text-gray-400">
                            {formatDate(order.updatedAt)} at{" "}
                            {new Date(order.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                        <p className="text-sm text-gray-400">Order has been successfully fulfilled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order_Details 