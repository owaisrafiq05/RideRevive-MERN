"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import {
  ShoppingBag,
  ChevronRight,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react"

const Order_List = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/orders`)
      if (response.data.success) {
        setOrders(response.data.data)
      } else {
        toast.error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Something went wrong while fetching orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredOrders = () => {
    return orders
      .filter((order) => {
        if (filter === "all") return true
        return order.status === filter
      })
      .filter((order) => {
        if (!searchQuery) return true
        const orderId = order._id.toLowerCase()
        const customerName = order.user?.name?.toLowerCase() || ""
        const search = searchQuery.toLowerCase()
        return orderId.includes(search) || customerName.includes(search)
      })
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-400" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-blue-400" />
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
              <p className="text-gray-400">View and manage all customer orders</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800 mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      filter === "all" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      filter === "pending" ? "bg-amber-600/80 text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter("in-progress")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      filter === "in-progress" ? "bg-blue-600/80 text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setFilter("completed")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      filter === "completed" ? "bg-green-600/80 text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Search order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Orders</h2>
            <span className="text-gray-400 text-sm">
              {getFilteredOrders().length} {getFilteredOrders().length === 1 ? "order" : "orders"} found
            </span>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : getFilteredOrders().length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Orders Found</h3>
                <p className="text-gray-400 mb-6">There are no orders matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-800">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Vehicle</th>
                      <th className="pb-3 font-medium">Services</th>
                      <th className="pb-3 font-medium">Date & Time</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Payment</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map((order) => (
                      <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-4 text-white font-medium">{order._id.substring(0, 8)}</td>
                        <td className="py-4 text-gray-300">{order.user?.name || "Unknown"}</td>
                        <td className="py-4 text-gray-300">
                          {order.car?.make} {order.car?.model}
                        </td>
                        <td className="py-4 text-gray-300">
                          {order.services.map((item) => item.serviceName || item.service?.name || "Unknown Service").join(", ")}
                        </td>
                        <td className="py-4 text-gray-300">
                          <div className="flex flex-col">
                            <span>{formatDate(order.scheduledDate)}</span>
                            <span className="text-xs text-gray-400">{formatTime(order.scheduledDate)}</span>
                          </div>
                        </td>
                        <td className="py-4 text-white font-medium">${order.totalAmount}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-${getStatusColor(
                              order.status
                            )}-600/20 text-${getStatusColor(order.status)}-400`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              order.paymentStatus === "paid"
                                ? "bg-green-600/20 text-green-400"
                                : "bg-amber-600/20 text-amber-400"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
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
      </div>
    </div>
  )
}

export default Order_List 