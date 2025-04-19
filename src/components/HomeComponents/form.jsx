"use client"

import { useState } from "react"

const CarForm = () => {
  const [step, setStep] = useState(1)
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

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Submit form data to the server or handle it as needed
    console.log(formData)
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-[#242424] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#2a2a2a] p-8 rounded-lg shadow-xl border border-gray-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Vehicle Registration</h2>

          {/* Progress bar */}
          <div className="relative pt-1 mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex flex-col items-center ${step >= stepNumber ? "text-blue-500" : "text-gray-500"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= stepNumber ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} mb-1`}
                  >
                    {step > stepNumber ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className="text-xs">
                    {stepNumber === 1 ? "Basic Info" : stepNumber === 2 ? "Details" : "Specifications"}
                  </span>
                </div>
              ))}
            </div>
            <div className="overflow-hidden h-2 mb-4 flex rounded bg-gray-700">
              <div
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-5 transition-all duration-300">
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Make</label>
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
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Model</label>
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
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Year</label>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 transition-all duration-300">
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">License Plate</label>
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
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Color</label>
                <div className="relative">
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. Silver"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 appearance-none"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 transition-all duration-300">
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Transmission</label>
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
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">Mileage (km)</label>
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
              <div className="space-y-1">
                <label className="block text-gray-300 text-sm font-medium">VIN</label>
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
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="bg-transparent hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-md border border-gray-600 transition-all duration-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-md transition-all duration-200 flex items-center shadow-lg shadow-blue-900/20"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-md transition-all duration-200 flex items-center shadow-lg shadow-blue-900/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CarForm
