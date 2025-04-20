"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import { Car, Plus, Trash2, User } from "lucide-react"

const CarCard = ({ car, onDelete }) => (
  <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] rounded-xl shadow-lg overflow-hidden flex flex-col justify-between p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center">
        <div className="bg-blue-600 p-2 rounded-lg mr-3">
          <Car className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {car.year} {car.make} {car.model}
        </h2>
      </div>
      <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
        {car.transmission}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">License Plate</p>
        <p className="text-sm font-medium text-white">{car.licensePlate}</p>
      </div>
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Color</p>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: car.color.toLowerCase() }}></div>
          <p className="text-sm font-medium text-white">{car.color}</p>
        </div>
      </div>
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Fuel Type</p>
        <p className="text-sm font-medium text-white">{car.fuelType}</p>
      </div>
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Mileage</p>
        <p className="text-sm font-medium text-white">{car.mileage} km</p>
      </div>
    </div>

    <div className="flex justify-between gap-3 mt-auto">
      <button className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
        <User className="h-4 w-4" />
        <span>Seller Info</span>
      </button>
      <button
        onClick={() => onDelete(car._id)}
        className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  </div>
)

const CarListingsApp = () => {
  const [carListings, setCarListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const fetchCars = async () => {
    setIsLoading(true)
    const token = Cookies.get("token")
    if (!token) {
      toast.error("User not authenticated.")
      setIsLoading(false)
      return
    }

    const decodedToken = jwtDecode(token)
    const userId = decodedToken._id

    try {
      const response = await axios.get(`http://localhost:3000/api/cars/user/${userId}`)
      if (response.data.status) {
        setCarListings(response.data.data) // Set the car listings from the response
        toast.success(response.data.message || "Cars retrieved successfully!")
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
      if (error.response) {
        toast.error(error.response.data.message || "Failed to retrieve cars")
      } else if (error.request) {
        toast.error("No response from server. Please try again later.")
      } else {
        toast.error("An error occurred while fetching cars")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCars() // Call fetchCars on component mount
  }, [])

  const handleAddClick = () => {
    navigate("/form")
  }

  const handleDelete = async (carId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/cars/${carId}`)
      if (response.data.status) {
        toast.success(response.data.message || "Car deleted successfully!")
        // Fetch the updated list of cars
        fetchCars() // Call fetchCars to refresh the list
      }
    } catch (error) {
      console.error("Error deleting car:", error)
      if (error.response) {
        toast.error(error.response.data.message || "Failed to delete car")
      } else if (error.request) {
        toast.error("No response from server. Please try again later.")
      } else {
        toast.error("An error occurred while deleting the car")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white">
      {/* Sidebar */}

      {/* Main content */}
      <div className="w-full pl-24 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Car Listings</h1>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-5 w-5" />
            Add New Car
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : carListings.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Cars Found</h3>
            <p className="text-gray-400 mb-6">You haven't added any cars to your listings yet.</p>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Your First Car
            </button>
          </div>
        ) : (
          <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carListings.map((car) => (
              <CarCard key={car._id} car={car} onDelete={handleDelete} />
            ))}
          </main>
        )}
      </div>
    </div>
  )
}

export default CarListingsApp
