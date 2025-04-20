"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import { toast } from "sonner"
import {
  Car,
  Droplet,
  Battery,
  CircleDashed,
  Truck,
  Wrench,
  Bell,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

const Dashboard = () => {
  const [user, setUser] = useState({ name: "User" })
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingServices, setUpcomingServices] = useState([])
  const [serviceHistory, setServiceHistory] = useState([])
  const [stats, setStats] = useState({
    totalVehicles: 0,
    pendingServices: 0,
    completedServices: 0,
    totalSpent: 0,
  })
  const navigate = useNavigate()

  // Mock upcoming services data
  const mockUpcomingServices = [
    {
      id: "srv-1234",
      type: "Oil Change",
      vehicle: "2019 Toyota Camry",
      date: "2023-05-15",
      time: "10:30 AM",
      status: "scheduled",
      icon: <Droplet className="h-5 w-5 text-purple-400" />,
      color: "purple",
    },
    {
      id: "srv-2345",
      type: "Battery Replacement",
      vehicle: "2020 Honda Civic",
      date: "2023-05-18",
      time: "2:00 PM",
      status: "confirmed",
      icon: <Battery className="h-5 w-5 text-green-400" />,
      color: "green",
    },
  ]

  // Mock service history data
  const mockServiceHistory = [
    {
      id: "srv-0123",
      type: "Tire Replacement",
      vehicle: "2019 Toyota Camry",
      date: "2023-04-10",
      cost: 320,
      icon: <CircleDashed className="h-5 w-5 text-gray-400" />,
      color: "gray",
    },
    {
      id: "srv-9876",
      type: "Car Wash",
      vehicle: "2020 Honda Civic",
      date: "2023-04-05",
      cost: 45,
      icon: <Droplet className="h-5 w-5 text-blue-400" />,
      color: "blue",
    },
    {
      id: "srv-8765",
      type: "Emergency Rescue",
      vehicle: "2019 Toyota Camry",
      date: "2023-03-22",
      cost: 150,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: "red",
    },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token")
        if (token) {
          const decodedToken = jwtDecode(token)
          // In a real app, you would fetch the user's full profile
          setUser({
            name: decodedToken.name || "User",
            id: decodedToken._id,
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    const fetchVehicles = async () => {
      setIsLoading(true)
      try {
        const token = Cookies.get("token")
        if (!token) {
          toast.error("User not authenticated.")
          setIsLoading(false)
          return
        }

        const decodedToken = jwtDecode(token)
        const userId = decodedToken._id

        const response = await axios.get(`http://localhost:3000/api/cars/user/${userId}`)
        if (response.data.status) {
          setVehicles(response.data.data)
          setStats((prev) => ({ ...prev, totalVehicles: response.data.data.length }))
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const loadDashboardData = () => {
      // In a real app, these would be actual API calls
      setUpcomingServices(mockUpcomingServices)
      setServiceHistory(mockServiceHistory)
      setStats({
        totalVehicles: vehicles.length,
        pendingServices: mockUpcomingServices.length,
        completedServices: mockServiceHistory.length,
        totalSpent: mockServiceHistory.reduce((total, service) => total + service.cost, 0),
      })
    }

    fetchUserData()
    fetchVehicles()

    // Small delay to simulate API calls
    setTimeout(() => {
      loadDashboardData()
    }, 1000)
  }, [])

  const navigateToService = (path) => {
    navigate(path)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const services = [
    {
      name: "Fuel Delivery",
      path: "/fuel-delivery",
      icon: <Truck className="h-6 w-6 text-amber-400" />,
      color: "amber",
    },
    {
      name: "Car Washing",
      path: "/car-washing",
      icon: <Droplet className="h-6 w-6 text-blue-400" />,
      color: "blue",
    },
    {
      name: "Tire Services",
      path: "/tire-services",
      icon: <CircleDashed className="h-6 w-6 text-gray-400" />,
      color: "gray",
    },
    {
      name: "Emergency Rescue",
      path: "/emergency-rescue",
      icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
      color: "red",
    },
    {
      name: "Battery Services",
      path: "/battery-services",
      icon: <Battery className="h-6 w-6 text-green-400" />,
      color: "green",
    },
    {
      name: "Engine Oil Services",
      path: "/engine-oil-services",
      icon: <Droplet className="h-6 w-6 text-purple-400" />,
      color: "purple",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white">
      {/* Main content */}
      <div className="w-full pl-24 p-6">
        {/* Welcome section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Hey{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>
              <p className="text-gray-400">Welcome to your vehicle dashboard</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => navigate("/form")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
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
                <Car className="h-6 w-6 text-blue-400" />
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
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Services</p>
                <h3 className="text-2xl font-bold text-white">{stats.pendingServices}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed Services</p>
                <h3 className="text-2xl font-bold text-white">{stats.completedServices}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden p-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <h3 className="text-2xl font-bold text-white">${stats.totalSpent}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - My Vehicles */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800 h-full">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">My Vehicles</h2>
                <button
                  onClick={() => navigate("/form")}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Vehicles Found</h3>
                    <p className="text-gray-400 mb-6">You haven't added any vehicles yet.</p>
                    <button
                      onClick={() => navigate("/form")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                        onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                              <Car className="h-4 w-4 text-blue-400" />
                            </div>
                            <h3 className="font-medium text-white">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                          </div>
                          <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                            {vehicle.transmission}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-xs">
                            <span className="text-gray-400">License: </span>
                            <span className="text-gray-300">{vehicle.licensePlate}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Color: </span>
                            <span className="text-gray-300">{vehicle.color}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Fuel: </span>
                            <span className="text-gray-300">{vehicle.fuelType}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Mileage: </span>
                            <span className="text-gray-300">{vehicle.mileage} km</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => navigate("/vehicles")}
                      className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-1"
                    >
                      View All Vehicles <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle column - Upcoming Services */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800 h-full">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Upcoming Services</h2>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Calendar className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {upcomingServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Upcoming Services</h3>
                    <p className="text-gray-400 mb-6">You don't have any scheduled services.</p>
                    <button
                      onClick={() => navigate("/services")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Book a Service
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingServices.map((service) => (
                      <div
                        key={service.id}
                        className={`bg-${service.color}-600/10 rounded-lg p-4 border border-${service.color}-500/30 hover:border-${service.color}-500 transition-all cursor-pointer`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className={`bg-${service.color}-600/20 p-2 rounded-lg mr-3`}>{service.icon}</div>
                            <div>
                              <h3 className="font-medium text-white">{service.type}</h3>
                              <p className="text-xs text-gray-400">{service.vehicle}</p>
                            </div>
                          </div>
                          <div
                            className={`bg-${service.status === "confirmed" ? "green" : "amber"}-600/20 text-${
                              service.status === "confirmed" ? "green" : "amber"
                            }-400 px-2 py-1 rounded-full text-xs font-semibold capitalize`}
                          >
                            {service.status}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(service.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{service.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => navigate("/services")}
                      className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-1"
                    >
                      Book a Service <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Service History & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Service History */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Service History</h2>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Wrench className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {serviceHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No service history available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceHistory.map((service) => (
                      <div
                        key={service.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className={`bg-${service.color}-600/20 p-2 rounded-lg mr-3`}>{service.icon}</div>
                            <div>
                              <h3 className="font-medium text-white">{service.type}</h3>
                              <p className="text-xs text-gray-400">{service.vehicle}</p>
                            </div>
                          </div>
                          <div className="text-white font-medium">${service.cost}</div>
                        </div>
                        <div className="flex items-center text-sm mt-2">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(service.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 flex items-center justify-center gap-1">
                      View Full History <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {services.slice(0, 4).map((service) => (
                    <button
                      key={service.name}
                      className={`bg-${service.color}-600/10 hover:bg-${service.color}-600/20 rounded-lg p-4 border border-${service.color}-500/30 transition-all flex flex-col items-center justify-center gap-2 text-center`}
                      onClick={() => navigateToService(service.path)}
                    >
                      <div className={`bg-${service.color}-600/20 p-2 rounded-lg`}>{service.icon}</div>
                      <span className="text-sm font-medium text-white">{service.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/services")}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  View All Services <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Health */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Vehicle Health Overview</h2>
            </div>

            <div className="p-6">
              {vehicles.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">Add a vehicle to see health metrics.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-amber-600/20 p-2 rounded-lg">
                        <Gauge className="h-5 w-5 text-amber-400" />
                      </div>
                      <h3 className="font-medium text-white">Oil Life</h3>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">65% Remaining</span>
                      <span className="text-amber-400">Change in ~1,200 km</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-600/20 p-2 rounded-lg">
                        <Battery className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="font-medium text-white">Battery Health</h3>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">85% Capacity</span>
                      <span className="text-green-400">Good Condition</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600/20 p-2 rounded-lg">
                        <CircleDashed className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-medium text-white">Tire Pressure</h3>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">All tires optimal</span>
                      <span className="text-blue-400">Last checked: 3 days ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Reminders */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Maintenance Reminders</h2>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-amber-600/10 rounded-lg p-4 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600/20 p-2 rounded-lg mt-1">
                      <Bell className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Oil Change Due Soon</h3>
                      <p className="text-sm text-gray-400">
                        Your 2019 Toyota Camry is due for an oil change in approximately 1,200 km or 2 weeks.
                      </p>
                      <button className="mt-3 text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1">
                        Schedule Now <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-lg mt-1">
                      <Droplet className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Tire Rotation Recommended</h3>
                      <p className="text-sm text-gray-400">
                        Your 2020 Honda Civic is due for a tire rotation. Last rotation was 6 months ago.
                      </p>
                      <button className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        Schedule Now <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-green-600/10 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600/20 p-2 rounded-lg mt-1">
                      <Wrench className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Annual Inspection Coming Up</h3>
                      <p className="text-sm text-gray-400">
                        Your 2019 Toyota Camry is due for its annual inspection in 3 weeks.
                      </p>
                      <button className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
                        Schedule Now <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
