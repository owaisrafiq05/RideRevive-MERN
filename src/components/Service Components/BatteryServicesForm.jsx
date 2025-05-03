"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronLeft, ArrowRight, Battery, Calendar, Clock, Car, MapPin, Zap, Gauge, Wrench, Info, DollarSign, CreditCard, Search } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const BatteryServicesForm = () => {
  const [formData, setFormData] = useState({
    serviceType: "replacement",
    batteryType: "standard",
    vehicleType: "sedan",
    bookingType: "scheduled",
    scheduledDate: "",
    scheduledTime: "",
    location: "",
    coordinates: { lng: null, lat: null },
    addJumpStart: false,
    addInspection: false,
    notes: "",
    carId: ""
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [userCars, setUserCars] = useState([])
  const [userId, setUserId] = useState("") 
  const [batteryServiceId, setBatteryServiceId] = useState("") // To store the battery service ID
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

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
    setCurrentStep(3)
  }

  const handleConfirmOrder = async () => {
    // Verify user is authenticated
    const token = Cookies.get("token")
    if (!token) {
      toast.error("You must be logged in to place an order.")
      return
    }
    
    // Verify car is selected
    if (!formData.carId) {
      toast.error("Please select a vehicle for this service")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let serviceId = batteryServiceId;
      let serviceName = `${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)} Battery Service`;
      
      // If no battery service ID is available, create one first
      if (!serviceId) {
        try {
          // Create a new battery service
          const newServiceResponse = await axios.post('http://localhost:3000/api/services', {
            name: serviceName,
            description: 'Battery services including replacement, charging, and diagnostics.',
            category: 'battery',
            basePrice: calculatePrice(),
            estimatedTime: {
              value: parseInt(estimatedDuration.split('-')[0]),
              unit: 'minutes'
            },
            image: 'battery-service.jpg',
            isActive: true,
            compatibleVehicleTypes: ['sedan', 'suv', 'truck', 'van', 'hatchback', 'convertible', 'other']
          });
          
          if (newServiceResponse.data.success) {
            serviceId = newServiceResponse.data.data._id;
            toast.success("Created battery service");
          } else {
            throw new Error("Failed to create battery service");
          }
        } catch (serviceError) {
          console.error('Error creating service:', serviceError);
          toast.error('Could not create battery service. Please try again later.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // If we have a service ID, attempt to get its name
      try {
        const serviceResponse = await axios.get(`http://localhost:3000/api/services/${serviceId}`);
        if (serviceResponse.data.success) {
          serviceName = serviceResponse.data.data.name;
        }
      } catch (err) {
        // If service fetch fails, just use the default name we already set
        console.log("Could not fetch service details, using default name");
      }
      
      // Extract service details for the admin panel
      const serviceDetails = {
        serviceType: formData.serviceType,
        batteryType: formData.batteryType,
        vehicleType: formData.vehicleType,
        bookingType: formData.bookingType,
        scheduledInfo: formData.bookingType === "scheduled" ? {
          date: formData.scheduledDate,
          time: formData.scheduledTime
        } : null,
        warrantyOption: formData.warrantyOption,
        estimatedDuration: estimatedDuration,
        estimatedPrice: estimatedPrice
      };
      
      // Create the order on the server
      const response = await axios.post('http://localhost:3000/api/orders/create', {
        userId: userId,
        carId: formData.carId,
        services: [{
          service: serviceId,
          serviceName: serviceName,
          price: parseFloat(estimatedPrice),
          serviceDetails: serviceDetails
        }],
        address: {
          fullAddress: formData.location,
          coordinates: formData.coordinates
        },
        totalAmount: parseFloat(estimatedPrice),
        scheduledDate: formData.bookingType === "scheduled" ? 
          new Date(`${formData.scheduledDate}T${formData.scheduledTime}`) : 
          new Date(),
        specialInstructions: formData.notes,
        paymentMethod: 'credit_card', // Default payment method
        paymentStatus: 'paid' // For simplicity, we're marking it as paid
      });
      
      if (response.data.success) {
        toast.success("Your order has been placed successfully!");
        // Show order completion screen
        setCurrentStep(4);
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      coordinates: { lng: null, lat: null },
      addJumpStart: false,
      addInspection: false,
      notes: "",
      carId: ""
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

  // Fetch user's cars and battery service
  useEffect(() => {
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
      setUserId(userId)
  
      try {
        const response = await axios.get(`http://localhost:3000/api/cars/user/${userId}`)
        if (response.data.success) {
          setUserCars(response.data.data)
          toast.success("Cars retrieved successfully!")
        } else if (response.data.status) {
          // Fallback for API that might use status instead of success
          setUserCars(response.data.data)
          toast.success("Cars retrieved successfully!")
        } else {
          toast.error("Failed to retrieve cars")
        }
        
        // Fetch the battery service
        const serviceResponse = await axios.get("http://localhost:3000/api/services")
        if (serviceResponse.data.success) {
          const batteryService = serviceResponse.data.data.find(service => 
            service.name.toLowerCase().includes('battery')
          )
          
          if (batteryService) {
            setBatteryServiceId(batteryService._id)
          } else {
            console.log("Battery service not found, will create one during order")
          }
        } else {
          console.log("Failed to retrieve services")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        if (error.response) {
          toast.error(error.response.data.message || "Failed to retrieve data")
        } else if (error.request) {
          toast.error("No response from server. Please try again later.")
        } else {
          toast.error("An error occurred while fetching data")
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchCars()
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    
    // Default location
    const defaultLocation = { lng: -74.0060, lat: 40.7128 }; // New York City
    
    // Initialize the map
    mapInstanceRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [defaultLocation.lng, defaultLocation.lat],
      zoom: 13
    });
    
    // Add navigation controls
    mapInstanceRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add marker
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
    markerElement.style.width = '30px';
    markerElement.style.height = '30px';
    markerElement.style.backgroundImage = 'url("https://docs.mapbox.com/mapbox-gl-js/assets/pin.svg")';
    markerElement.style.backgroundSize = 'cover';
    markerElement.style.cursor = 'pointer';
    
    markerRef.current = new mapboxgl.Marker({ 
      element: markerElement,
      draggable: true 
    })
      .setLngLat([defaultLocation.lng, defaultLocation.lat])
      .addTo(mapInstanceRef.current);
    
    // Add event listener for when the marker is dragged
    markerRef.current.on('dragend', () => {
      const lngLat = markerRef.current.getLngLat();
      
      // Update form data with coordinates
      setFormData(prevData => ({
        ...prevData,
        coordinates: { lng: lngLat.lng, lat: lngLat.lat }
      }));
      
      // Get address from coordinates (reverse geocoding)
      fetchLocationAddress(lngLat.lng, lngLat.lat);
    });
    
    // Add event listener for map click
    mapInstanceRef.current.on('click', (e) => {
      // Update marker position
      markerRef.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      
      // Update form data with coordinates
      setFormData(prevData => ({
        ...prevData,
        coordinates: { lng: e.lngLat.lng, lat: e.lngLat.lat }
      }));
      
      // Get address from coordinates (reverse geocoding)
      fetchLocationAddress(e.lngLat.lng, e.lngLat.lat);
    });
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lng: position.coords.longitude,
            lat: position.coords.latitude
          };
          
          // Update map and marker
          mapInstanceRef.current.flyTo({
            center: [currentLocation.lng, currentLocation.lat],
            essential: true
          });
          
          markerRef.current.setLngLat([currentLocation.lng, currentLocation.lat]);
          
          // Update form data with coordinates
          setFormData(prevData => ({
            ...prevData,
            coordinates: currentLocation
          }));
          
          // Get address from coordinates (reverse geocoding)
          fetchLocationAddress(currentLocation.lng, currentLocation.lat);
        },
        () => {
          // Handle location permission denied
          console.log('Location permission denied');
        }
      );
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to fetch address from coordinates using Mapbox Geocoding API
  const fetchLocationAddress = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setFormData(prevData => ({
          ...prevData,
          location: address
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Function to search for locations
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    // Update map center
    mapInstanceRef.current.flyTo({
      center: result.center,
      zoom: 15,
      essential: true
    });
    
    // Update marker
    markerRef.current.setLngLat(result.center);
    
    // Update form data
    setFormData(prevData => ({
      ...prevData,
      location: result.place_name,
      coordinates: { lng: result.center[0], lat: result.center[1] }
    }));
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

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

          {/* Step 3: Checkout */}
          {currentStep === 3 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Complete Your Order</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Service Type:</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600/20 p-1.5 rounded-md">{serviceIcons[formData.serviceType]}</div>
                      <span className="font-medium text-white capitalize">
                        {formData.serviceType}
                      </span>
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

                  {formData.addJumpStart && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Add Jump Start:</span>
                      <span className="font-medium text-white">Yes (+$25)</span>
                    </div>
                  )}

                  {formData.addInspection && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Add Electrical Inspection:</span>
                      <span className="font-medium text-white">Yes (+$35)</span>
                    </div>
                  )}

                  {formData.notes && (
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-gray-300">Notes:</span>
                      <span className="font-medium text-white max-w-[250px] text-right">{formData.notes}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-green-300">${estimatedPrice}</span>
                  </div>
                </div>

                <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Your order details are shown above. Click "Confirm Order" to proceed with payment and schedule your service.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-700 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                            transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg 
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
                      <>
                        Confirm Order <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Order Confirmation */}
          {currentStep === 4 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl text-center">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
                <p className="text-gray-300 max-w-md">
                  {formData.bookingType === "scheduled"
                    ? "Your battery service has been scheduled. We'll send you a confirmation email with all the details."
                    : "Your on-demand battery service request has been received. Our technician will contact you shortly with an estimated arrival time."}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Service:</span>
                  <span className="font-medium text-white capitalize">
                    {formData.serviceType} {formData.serviceType === "replacement" ? `(${formData.batteryType})` : ""}
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
                  <span className="text-gray-300">Location:</span>
                  <span className="font-medium text-white">{formData.location}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="font-bold text-green-300">${estimatedPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="font-medium text-white">{estimatedDuration} minutes</span>
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
          
          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  )
}

export default BatteryServicesForm

