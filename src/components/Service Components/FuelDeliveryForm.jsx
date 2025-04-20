"use client"

import { useState } from "react"
import { Fuel, MapPin, Droplets, CreditCard, ArrowRight, Check, ChevronLeft, Truck, DollarSign } from "lucide-react"

const FuelDeliveryForm = () => {
  const [formData, setFormData] = useState({
    fuelType: "petrol",
    quantity: "",
    location: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const calculatePrice = () => {
    // Mock price calculation
    const basePrice = formData.fuelType === "petrol" ? 1.5 : 1.7 // per liter
    const quantity = Number.parseFloat(formData.quantity) || 0
    const deliveryFee = 5
    return (basePrice * quantity + deliveryFee).toFixed(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const price = calculatePrice()
      setEstimatedPrice(price)
      setCurrentStep(2)
      setIsLoading(false)
    }, 1500)
  }

  const handleProceedToCheckout = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setCurrentStep(3)
      setIsLoading(false)
    }, 1500)
  }

  const handleNewOrder = () => {
    setFormData({
      fuelType: "petrol",
      quantity: "",
      location: "",
    })
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col flex-1">
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600/20 p-2 rounded-lg">
              <Fuel className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Fuel Delivery Service
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : <Droplets className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Details</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 2 ? "bg-amber-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Price</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 3 ? "bg-amber-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2 text-gray-300">Checkout</span>
              </div>
            </div>
          </div>

          {/* Step 1: Fuel Details Form */}
          {currentStep === 1 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Enter Fuel Delivery Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Fuel size={16} className="text-amber-400" />
                      Fuel Type <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border ${
                          formData.fuelType === "petrol"
                            ? "border-amber-500 bg-amber-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 flex items-center gap-3`}
                        onClick={() => setFormData({ ...formData, fuelType: "petrol" })}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.fuelType === "petrol" ? "border-amber-500" : "border-gray-600"
                          }`}
                        >
                          {formData.fuelType === "petrol" && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
                        </div>
                        <span className="font-medium">Petrol</span>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${
                          formData.fuelType === "diesel"
                            ? "border-amber-500 bg-amber-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 flex items-center gap-3`}
                        onClick={() => setFormData({ ...formData, fuelType: "diesel" })}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.fuelType === "diesel" ? "border-amber-500" : "border-gray-600"
                          }`}
                        >
                          {formData.fuelType === "diesel" && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
                        </div>
                        <span className="font-medium">Diesel</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Droplets size={16} className="text-amber-400" />
                      Quantity (Liters) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="w-full p-4 pl-12 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200"
                        placeholder="e.g. 10"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-400">L</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      {[5, 10, 20].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className={`px-4 py-2 rounded-lg ${
                            formData.quantity === amount.toString()
                              ? "bg-amber-600/20 text-amber-400 border border-amber-500/50"
                              : "bg-gray-800 text-gray-300 border border-gray-700"
                          } transition-colors`}
                          onClick={() => setFormData({ ...formData, quantity: amount.toString() })}
                        >
                          {amount}L
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <MapPin size={16} className="text-amber-400" />
                      Delivery Location <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200"
                      placeholder="Enter your current location or address"
                      rows={3}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700 flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                            transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg 
                            transition-colors duration-200 font-medium flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    {isLoading ? (
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
                      <>
                        Get Price Estimate <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Price Estimate */}
          {currentStep === 2 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Price Estimate</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Fuel Type:</span>
                    <span className="font-medium text-white capitalize">{formData.fuelType}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Quantity:</span>
                    <span className="font-medium text-white">{formData.quantity} Liters</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Delivery Location:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">{formData.location}</span>
                  </div>
                  <div className="border-t border-gray-700 my-4"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Fuel Cost:</span>
                    <span className="font-medium text-white">${(estimatedPrice - 5).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Delivery Fee:</span>
                    <span className="font-medium text-white">$5.00</span>
                  </div>
                  <div className="border-t border-gray-700 my-4"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-amber-400">${estimatedPrice}</span>
                  </div>
                </div>

                <div className="bg-amber-600/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Your fuel will be delivered within 30-60 minutes after checkout. Our driver will contact you when
                    they're on the way.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-700 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                            transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={isLoading}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg 
                            transition-colors duration-200 font-medium flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    {isLoading ? (
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
                      <>
                        Proceed to Checkout <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Checkout Confirmation */}
          {currentStep === 3 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl text-center">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
                <p className="text-gray-300 max-w-md">
                  Your fuel delivery order has been confirmed. Our driver will contact you shortly with the estimated
                  arrival time.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Order ID:</span>
                  <span className="font-medium text-white">FD-{Math.floor(Math.random() * 10000)}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Fuel Type:</span>
                  <span className="font-medium text-white capitalize">{formData.fuelType}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="font-medium text-white">{formData.quantity} Liters</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="font-bold text-amber-400">${estimatedPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Estimated Delivery:</span>
                  <span className="font-medium text-white">30-60 minutes</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNewOrder}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium"
              >
                Place Another Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FuelDeliveryForm
