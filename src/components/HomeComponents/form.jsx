import { useState } from "react"
import { ChevronLeft, Info } from "lucide-react"

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <div className="min-h-screen bg-[#242424] text-white flex flex-col flex-1">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-400">Back to Vehicles</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">New Vehicle Registration</h1>
            <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full">
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg font-medium">Vehicle Information</span>
              <button className="p-1 hover:bg-[#333] rounded-full transition-colors">
                <Info size={16} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. Toyota"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. Camry"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                    placeholder="e.g. ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. Silver"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Transmission</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Mileage (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">VIN</label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 1HGBH41JXMN109186"
                  />
                  <p className="text-xs text-gray-400 mt-1">Vehicle Identification Number (17 characters)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-transparent hover:bg-gray-700 text-white rounded-lg 
                          transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                          transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Submit Registration
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