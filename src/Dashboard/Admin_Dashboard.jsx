"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import { toast } from "sonner"
import {
  Users,
  Car,
  ShoppingBag,
  Wrench,
  Bell,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  User,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react"

const AdminDashboard = () => {
  const [admin, setAdmin] = useState({ name: "Admin" })
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topServices, setTopServices] = useState([])
  const navigate = useNavigate()

  // Mock top services data
  const mockTopServices = [
    {
      name: "Fuel Delivery",
      count: 32,
      revenue: 2080,
      icon: <ShoppingBag className="h-5 w-5 text-amber-400" />,
      color: "amber",
    },
    {
      name: "Car Washing",
      count: 28,
      revenue: 1260,
      icon: <Car className="h-5 w-5 text-blue-400" />,
      color: "blue",
    },
    {
      name: "Tire Services",
      count: 24,
      revenue: 2160,
      icon: <Wrench className="h-5 w-5 text-gray-400" />,
      color: "gray",
    },
    {
      name: "Emergency Rescue",
      count: 18,
      revenue: 2700,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: "red",
    },
  ]

  // Mock monthly revenue data
  const revenueData = [
    { month: "Jan", amount: 8420 },
    { month: "Feb", amount: 9650 },
    { month: "Mar", amount: 11200 },
    { month: "Apr", amount: 10800 },
    { month: "May", amount: 15420 },
  ]

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = Cookies.get("token")
        if (token) {
          const decodedToken = jwtDecode(token)
          // For a real app, you would verify admin status
          setAdmin({
            name: decodedToken.name || "Admin",
            id: decodedToken._id,
          })
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      }
    }

    fetchAdminData()
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Fetch all orders
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/orders`)
      
      if (response.data.success) {
        const allOrders = response.data.data
        
        // Get recent orders (most recent 4)
        const sortedOrders = [...allOrders].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setRecentOrders(sortedOrders.slice(0, 4))
        
        // Calculate stats
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        const pendingOrders = allOrders.filter(order => order.status === "pending").length
        const completedOrders = allOrders.filter(order => order.status === "completed").length
        
        setStats(prev => ({
          ...prev,
          totalOrders: allOrders.length,
          totalRevenue,
          pendingOrders,
          completedOrders
        }))
        
        // Calculate top services (simplified)
        setTopServices(mockTopServices)
      } else {
        toast.error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error loading dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user and vehicle stats
  const fetchStats = async () => {
    try {
      // In a real app, you would have endpoints for these stats
      // For now, let's use placeholder values
      setStats(prev => ({
        ...prev,
        totalUsers: 124,
        totalVehicles: 178
      }))
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white">
      {/* Main content */}
      <div className="w-full pl-24 p-6">
        {/* Welcome section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {admin.name}
                </span>
              </h1>
              <p className="text-gray-400">Admin Dashboard Overview</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => navigate("/admin/orders")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <ShoppingBag className="h-4 w-4" />
                View Orders
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Car className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Vehicles</p>
                <h3 className="text-2xl font-bold text-white">{stats.totalVehicles}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-amber-600/20 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <h3 className="text-2xl font-bold text-white">{stats.totalOrders}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-white">${stats.totalRevenue}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800 h-full">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Orders Found</h3>
                    <p className="text-gray-400 mb-6">There are no recent orders to display.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 text-sm border-b border-gray-800">
                          <th className="pb-3 font-medium">Order ID</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Service</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-4 text-white font-medium">{order._id.substring(0, 8)}</td>
                            <td className="py-4 text-gray-300">{order.user?.name || "Unknown"}</td>
                            <td className="py-4 text-gray-300">
                              {order.services.map(item => item.serviceName || item.service?.name || "Unknown Service").join(", ")}
                            </td>
                            <td className="py-4 text-gray-300">
                              <div className="flex flex-col">
                                <span>{formatDate(order.scheduledDate)}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(order.scheduledDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-white font-medium">${order.totalAmount}</td>
                            <td className="py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-${getStatusColor(
                                  order.status
                                )}-600/20 text-${getStatusColor(order.status)}-400`}
                              >
                                {order.status}
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
                    <button
                      onClick={() => navigate("/admin/orders")}
                      className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-4 flex items-center justify-center gap-1 mt-4"
                    >
                      View All Orders <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Order Stats & Top Services */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Order Statistics</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-amber-600/20 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                      <h3 className="font-medium text-white">Pending</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">Await completion</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-600/20 p-2 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="font-medium text-white">Completed</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">Successfully delivered</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">Order Completion Rate</h3>
                    <span className="text-green-400 text-sm font-medium">
                      {stats.totalOrders > 0 
                        ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ 
                        width: `${stats.totalOrders > 0 
                          ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Top Services</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {topServices.map((service) => (
                    <div key={service.name} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`bg-${service.color}-600/20 p-2 rounded-lg`}>{service.icon}</div>
                          <div>
                            <h3 className="font-medium text-white">{service.name}</h3>
                            <p className="text-xs text-gray-400">{service.count} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${service.revenue}</p>
                          <p className="text-xs text-gray-400">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
              <div className="flex gap-2">
                <button className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium">Monthly</button>
                <button className="text-gray-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-800">
                  Quarterly
                </button>
                <button className="text-gray-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-800">
                  Yearly
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-3">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 h-64 relative">
                    {/* Placeholder for chart */}
                    <div className="h-full w-full flex items-end justify-between">
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 bg-blue-500 rounded-t-lg relative"
                            style={{
                              height: `${(item.amount / 16000) * 150}px`,
                              backgroundImage: "linear-gradient(to top, #3b82f6, #60a5fa)",
                            }}
                          ></div>
                          <div className="mt-2 text-gray-400 text-sm">{item.month}</div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-0 left-0 p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">+12.5% from last month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 h-64 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-4">Revenue Distribution</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-400">Fuel Delivery</span>
                            <span className="text-sm text-white">32%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "32%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-400">Car Washing</span>
                            <span className="text-sm text-white">28%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "28%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-400">Tire Services</span>
                            <span className="text-sm text-white">24%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: "24%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-400">Others</span>
                            <span className="text-sm text-white">16%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "16%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
                      View Detailed Report <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Recent User Activity</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">John Doe</h3>
                      <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Placed an order for Fuel Delivery service</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-600/20 p-2 rounded-full">
                    <User className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">Sarah Williams</h3>
                      <span className="text-xs text-gray-400">3 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Added a new vehicle (2022 Tesla Model 3)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-600/20 p-2 rounded-full">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">Michael Johnson</h3>
                      <span className="text-xs text-gray-400">5 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Completed payment for Oil Change service</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-600/20 p-2 rounded-full">
                    <User className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">Emily Brown</h3>
                      <span className="text-xs text-gray-400">8 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Scheduled a Tire Rotation service for next week</p>
                  </div>
                </div>
              </div>

              <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-4 flex items-center justify-center gap-1 mt-4">
                View All Activity <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard