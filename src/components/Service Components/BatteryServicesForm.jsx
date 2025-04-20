"use client"

import { useState } from "react"
import { Check, ChevronLeft, ArrowRight, Battery, Calendar, Clock, Car, MapPin, Zap, Gauge, Wrench, Info, DollarSign, CreditCard } from 'lucide-react'

const BatteryServicesForm = () => {
  const [formData, setFormData] = useState({
    serviceType: "replacement",
    batteryType: "standard",
    vehicleType: "sedan",
    bookingType: "scheduled",
    scheduledDate: "",
    scheduledTime: "",
    location: "",
    addJumpStart: false,
    addInspection: false,
    notes: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value })
  }

  const calculatePrice = () => {
    // Base prices
    const basePrices = {
      replacement: {
        standard: 120,
        premium: 180,
        heavyDuty: 250,
      },
      charging: 40,
      diagnostics: 60,
    }

    // Calculate base price
    let price = 0
    if (formData.serviceType === "replacement") {
      price = basePrices.replacement[formData.batteryType]
    } else {
      price = basePrices[formData.serviceType]
    }

    // Add-ons
    if (formData.addJumpStart) price += 25
    if (formData.addInspection) price += 35

    // On-demand surcharge
    const onDemandSurcharge = formData.bookingType === "on-demand" ? 20 : 0

    return price + onDemandSurcharge
  }

  const calculateDuration = () => {
    // Duration estimates in minutes
    const baseDurations = {
      replacement: {
        standard: "30-45",
        premium: "30-45",
        heavyDuty: "45-60",
      },
      charging: "40-60",
      diagnostics: "20-30",
    }

    // Get base duration
    let duration = ""
    if (formData.serviceType === "replacement") {
      duration = baseDurations.replacement[formData.batteryType]
    } else {
      duration = baseDurations[formData.serviceType]
    }

    return duration
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const price = calculatePrice()
      const duration = calculateDuration()
      setEstimatedPrice(price)
      setEstimatedDuration(duration)
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

  const handleNewBooking = () => {
    setFormData({
      serviceType: "replacement",
      batteryType: "standard",
      vehicleType: "sedan",
      bookingType: "scheduled",
      scheduledDate: "",
      scheduledTime: "",
      location: "",
      addJumpStart: false,
      addInspection: false,
      notes: "",
    })
    setCurrentStep(1)
  }

  const serviceDescriptions = {
    replacement: "Complete battery replacement with a new battery of your choice.",
    charging: "Recharge your existing battery to restore power.",
    diagnostics: "Comprehensive testing of your battery and electrical system.",
  }

  const serviceIcons = {
    replacement: <Battery className="h-6 w-6" />,
    charging: <Zap className="h-6 w-6" />,
    diagnostics: <Gauge className="h-6 w-6" />,
  }

  const batteryTypeDescriptions = {
    standard: "Regular battery suitable for most vehicles with standard electrical needs.",
    premium: "Enhanced performance battery with longer lifespan and better cold weather starting.",
    heavyDuty: "Heavy-duty battery for vehicles with high electrical demands or commercial use.",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col flex-1">
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-green-600/20 p-2 rounded-lg">
              <Battery className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Battery Services
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
                    currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : <Battery className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Service</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 2 ? "bg-green-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Details</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 3 ? "bg-green-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2 text-gray-300">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Select Battery Service</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Battery size={16} className="text-green-400" />
                    Service Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["replacement", "charging", "diagnostics"].map((type) => (
                      <div
                        key={type}
                        className={`p-4 rounded-lg border ${
                          formData.serviceType === type
                            ? "border-green-500 bg-green-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 hover:border-green-400`}
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.serviceType === type
                                ? "bg-green-600/30 text-green-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {serviceIcons[type]}
                          </div>
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{serviceDescriptions[type]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Battery Type (only for replacement) */}
                {formData.serviceType === "replacement" && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Battery size={16} className="text-green-400" />
                      Battery Type <span className="text-red-400">*</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: "standard", label: "Standard" },
                        { id: "premium", label: "Premium" },
                        { id: "heavyDuty", label: "Heavy Duty" },
                      ].map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 rounded-lg border ${
                            formData.batteryType === type.id
                              ? "border-green-500 bg-green-600/10"
                              : "border-gray-700 bg-gray-800/50"
                          } cursor-pointer transition-all duration-200 hover:border-green-400`}
                          onClick={() => setFormData({ ...formData, batteryType: type.id })}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.batteryType === type.id ? "border-green-500" : "border-gray-600"
                              }`}
                            >
                              {formData.batteryType === type.id && (
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              )}
                            </div>
                            <span className="font-medium">{type.label}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{batteryTypeDescriptions[type.id]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Car size={16} className="text-green-400" />
                    Vehicle Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "sedan", label: "Sedan/Hatchback" },
                      { id: "suv", label: "SUV/Crossover" },
                      { id: "truck", label: "Truck/Van" },
                    ].map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 rounded-lg border ${
                          formData.vehicleType === type.id
                            ? "border-green-500 bg-green-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 hover:border-green-400 flex items-center gap-3`}
                        onClick={() => setFormData({ ...formData, vehicleType: type.id })}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.vehicleType === type.id ? "border-green-500" : "border-gray-600"
                          }`}
                        >
                          {formData.vehicleType === type.id && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                        </div>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Calendar size={16} className="text-green-400" />
                    Booking Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        formData.bookingType === "scheduled"
                          ? "border-green-500 bg-green-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-green-400`}
                      onClick={() => setFormData({ ...formData, bookingType: "scheduled" })}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.bookingType === "scheduled" ? "border-green-500" : "border-gray-600"
                          }`}
                        >
                          {formData.bookingType === "scheduled" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                        <span className="font-medium">Scheduled</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-8">Book a specific date and time for your battery service.</p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        formData.bookingType === "on-demand"
                          ? "border-green-500 bg-green-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-green-400`}
                      onClick={() => setFormData({ ...formData, bookingType: "on-demand" })}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.bookingType === "on-demand" ? "border-green-500" : "border-gray-600"
                          }`}
                        >
                          {formData.bookingType === "on-demand" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                        <span className="font-medium">On-Demand</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-8">
                        Get your battery service as soon as possible (additional fee applies).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Date and Time (only if scheduled is selected) */}
                {formData.bookingType === "scheduled" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                        <Calendar size={16} className="text-green-400" />
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                        required={formData.bookingType === "scheduled"}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                        <Clock size={16} className="text-green-400" />
                        Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                        required={formData.bookingType === "scheduled"}
                      />
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <MapPin size={16} className="text-green-400" />
                    Service Location <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                    placeholder="Enter your address or location for mobile service"
                    rows={3}
                    required
                  ></textarea>
                </div>

                {/* Additional Services */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Wrench size={16} className="text-green-400" />
                    Additional Services
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        formData.addJumpStart ? "border-green-500 bg-green-600/10" : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-green-400`}
                      onClick={() => setFormData({ ...formData, addJumpStart: !formData.addJumpStart })}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                            formData.addJumpStart ? "border-green-500 bg-green-500" : "border-gray-600"
                          }`}
                        >
                          {formData.addJumpStart && <Check className="h-3 w-3 text-black" />}
                        </div>
                        <div>
                          <span className="font-medium">Jump Start Service</span>
                          <p className="text-xs text-gray-400">Jump start your vehicle before battery service (+$25)</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        formData.addInspection ? "border-green-500 bg-green-600/10" : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-green-400`}
                      onClick={() => setFormData({ ...formData, addInspection: !formData.addInspection })}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                            formData.addInspection ? "border-green-500 bg-green-500" : "border-gray-600"
                          }`}
                        >
                          {formData.addInspection && <Check className="h-3 w-3 text-black" />}
                        </div>
                        <div>
                          <span className="font-medium">Electrical System Inspection</span>
                          <p className="text-xs text-gray-400">Full inspection of your vehicle's electrical system (+$35)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Info size={16} className="text-green-400" />
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                    placeholder="Any special instructions or requests..."
                    rows={3}
                  ></textarea>
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
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg 
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
                <h2 className="text-xl font-semibold text-white">Service Details</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Service Type:</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600/20 p-1.5 rounded-md">{serviceIcons[formData.serviceType]}</div>
                      <span className="font-medium text-white capitalize">{formData.serviceType}</span>
                    </div>
                  </div>

                  {formData.serviceType === "replacement" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Battery Type:</span>
                      <span className="font-medium text-white capitalize">{formData.batteryType}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Vehicle Type:</span>
                    <span className="font-medium text-white capitalize">{formData.vehicleType}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Booking Type:</span>
                    <span className="font-medium text-white capitalize">{formData.bookingType}</span>
                  </div>

                  {formData.bookingType === "scheduled" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Scheduled Time:</span>
                      <span className="font-medium text-white">
                        {formData.scheduledDate} at {formData.scheduledTime}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <span className="text-gray-300">Service Location:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">{formData.location}</span>
                  </div>

                  {formData.notes && (
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-gray-300">Notes:</span>
                      <span className="font-medium text-white max-w-[250px] text-right">{formData.notes}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  {/* Price Breakdown */}
                  {formData.serviceType === "replacement" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">
                        {formData.batteryType.charAt(0).toUpperCase() + formData.batteryType.slice(1)} Battery:
                      </span>
                      <span className="font-medium text-white">
                        $
                        {formData.batteryType === "standard"
                          ? "120"
                          : formData.batteryType === "premium"
                            ? "180"
                            : "250"}
                      </span>
                    </div>
                  )}

                  {formData.serviceType === "charging" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Battery Charging:</span>
                      <span className="font-medium text-white">$40</span>
                    </div>
                  )}

                  {formData.serviceType === "diagnostics" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Battery Diagnostics:</span>
                      <span className="font-medium text-white">$60</span>
                    </div>
                  )}

                  {formData.addJumpStart && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Jump Start Service:</span>
                      <span className="font-medium text-white">$25</span>
                    </div>
                  )}

                  {formData.addInspection && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Electrical System Inspection:</span>
                      <span className="font-medium text-white">$35</span>
                    </div>
                  )}

                  {formData.bookingType === "on-demand" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">On-Demand Fee:</span>
                      <span className="font-medium text-white">$20</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-green-400">${estimatedPrice}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Estimated Duration:</span>
                    <span className="font-medium text-white">{estimatedDuration} minutes</span>
                  </div>
                </div>

                <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    {formData.serviceType === "replacement"
                      ? "All replacement batteries come with a 24-month warranty. Our technician will properly dispose of your old battery."
                      : formData.serviceType === "charging"
                        ? "If your battery cannot hold a charge, we'll recommend a replacement option."
                        : "Our diagnostic service includes a detailed report of your battery's health and electrical system."}
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
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg 
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
                <h2 className="text-2xl font-bold text-white">Service Confirmed!</h2>
                <p className="text-gray-300 max-w-md">
                  {formData.bookingType === "scheduled"
                    ? "Your battery service has been scheduled. We'll send you a confirmation email with all the details."
                    : "Your on-demand battery service request has been received. Our technician will contact you shortly with an estimated arrival time."}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Booking ID:</span>
                  <span className="font-medium text-white">BS-{Math.floor(Math.random() * 10000)}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Service:</span>
                  <span className="font-medium text-white capitalize">
                    {formData.serviceType}
                    {formData.serviceType === "replacement" ? ` (${formData.batteryType})` : ""}
                  </span>
                </div>
                {formData.bookingType === "scheduled" ? (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Scheduled For:</span>
                    <span className="font-medium text-white">
                      {formData.scheduledDate} at {formData.scheduledTime}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Expected Arrival:</span>
                    <span className="font-medium text-white">Within 1-2 hours</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="font-bold text-green-400">${estimatedPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="font-medium text-white">{estimatedDuration} minutes</span>
                </div>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 mb-8 text-left">
                <Battery className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-300 mb-1">What to expect</p>
                  <p className="text-sm text-gray-300">
                    Our technician will arrive with all necessary equipment and batteries. Please ensure your vehicle is
                    accessible. Payment will be collected after the service is completed to your satisfaction.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNewBooking}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium"
              >
                Book Another Service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatteryServicesForm

