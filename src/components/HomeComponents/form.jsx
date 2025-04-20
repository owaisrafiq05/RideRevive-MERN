"use client"

import { useState } from "react"
import { ChevronLeft, Info, Car, Calendar, Hash, Palette, Fuel, Gauge, FileText, RotateCw } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"

const CarForm = () => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    fuelType: "petrol",
    transmission: "manual",
    mileage: "",
    vin: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const token = Cookies.get("token")
      console.log(token)
      if (!token) {
        toast.error("User not authenticated.")
        return
      }

      const decodedToken = jwtDecode(token)
      const userId = decodedToken._id

      const response = await axios.post("http://localhost:3000/api/cars/add", {
        user: userId,
        ...formData,
      })

      if (response.data.status) {
        toast.success(response.data.message || "Car added successfully!")
        setFormData({
          make: "",
          model: "",
          year: "",
          licensePlate: "",
          color: "",
          fuelType: "petrol",
          transmission: "manual",
          mileage: "",
          vin: "",
        })
      }
    } catch (error) {
      console.error("Error adding car:", error)
      if (error.response) {
        toast.error(error.response.data.message || "Failed to add car")
      } else if (error.request) {
        toast.error("No response from server. Please try again later.")
      } else {
        toast.error("An error occurred while adding the car")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddClick = () => {
    navigate("/vehicles")
  }

  return (
    <div className="relative pl-24 min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col flex-1">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
              onClick={handleAddClick}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-400">Back to Vehicles</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              New Vehicle Registration
            </h1>
            <button className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Car size={20} className="text-blue-400" />
              </div>
              <span className="text-xl font-medium">Vehicle Information</span>
              <button className="p-1 hover:bg-gray-800/50 rounded-full transition-colors ml-auto">
                <Info size={16} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {/* Make */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Car size={16} className="text-blue-400" />
                    Make <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="w-full p-3 pl-4 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      required
                      placeholder="e.g. Toyota"
                    />
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Car size={16} className="text-blue-400" />
                    Model <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. Camry"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Calendar size={16} className="text-blue-400" />
                    Year <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                {/* License Plate */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Hash size={16} className="text-blue-400" />
                    License Plate <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. ABC-1234"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Palette size={16} className="text-blue-400" />
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. Silver"
                  />
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Fuel size={16} className="text-blue-400" />
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <RotateCw size={16} className="text-blue-400" />
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Gauge size={16} className="text-blue-400" />
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </div>

                {/* VIN */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <FileText size={16} className="text-blue-400" />
                    VIN
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 1HGBH41JXMN109186"
                  />
                  <p className="text-xs text-gray-400 mt-1">Vehicle Identification Number (17 characters)</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700 flex flex-wrap justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                          transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                          transition-colors duration-200 font-medium flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarForm
