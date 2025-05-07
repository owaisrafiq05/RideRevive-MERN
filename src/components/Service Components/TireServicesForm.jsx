"use client"

import { Calendar } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import {
  Check,
  ChevronLeft,
  ArrowRight,
  CreditCard,
  Clock,
  MapPin,
  Gauge,
  RotateCw,
  Wrench,
  AlertTriangle,
  CircleDashed,
  Search,
  Car
} from "lucide-react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const TireServicesForm = () => {
  const [formData, setFormData] = useState({
    serviceType: "tireChange",
    tireCount: "4",
    tireSize: "",
    vehicleLocation: "",
    bookingType: "scheduled",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
    coordinates: { lng: null, lat: null },
    carId: ""
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [userCars, setUserCars] = useState([])
  const [userId, setUserId] = useState("") 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tireServiceId, setTireServiceId] = useState("") // To store the tire service ID
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const calculatePrice = () => {
    // Base prices
    const basePrices = {
      tireChange: 25, // per tire
      pressureCheck: 15, // flat fee
      punctureRepair: 20, // per tire
    }

    // Calculate based on service type and tire count
    let price = 0
    if (formData.serviceType === "pressureCheck") {
      price = basePrices.pressureCheck
    } else {
      const tiresCount = Number.parseInt(formData.tireCount)
      price = basePrices[formData.serviceType] * tiresCount
    }

    // On-demand surcharge
    const onDemandSurcharge = formData.bookingType === "on-demand" ? 15 : 0

    return price + onDemandSurcharge
  }

  const calculateDuration = () => {
    // Duration estimates in minutes
    const baseDurations = {
      tireChange: 15, // per tire
      pressureCheck: 20, // flat fee
      punctureRepair: 25, // per tire
    }

    // Calculate based on service type and tire count
    let duration = 0
    if (formData.serviceType === "pressureCheck") {
      duration = baseDurations.pressureCheck
    } else {
      const tiresCount = Number.parseInt(formData.tireCount)
      duration = baseDurations[formData.serviceType] * tiresCount
    }

    // Add setup time
    duration += 10

    return `${duration}-${duration + 15}`
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
      let serviceId = tireServiceId;
      let serviceName = `${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)}`;
      
      // If no tire service ID is available, create one first
      if (!serviceId) {
        try {
          // Create a new tire service
          const newServiceResponse = await axios.post(`${import.meta.env.VITE_SERVER_URL}/services`, {
            name: serviceName,
            description: 'Professional tire services including tire change, pressure check, and puncture repairs.',
            category: 'tires',
            basePrice: calculatePrice(),
            estimatedTime: {
              value: parseInt(estimatedDuration.split('-')[0]),
              unit: 'minutes'
            },
            image: 'tire-service.jpg',
            isActive: true,
            compatibleVehicleTypes: ['sedan', 'suv', 'truck', 'van', 'hatchback', 'convertible', 'other']
          });
          
          if (newServiceResponse.data.success) {
            serviceId = newServiceResponse.data.data._id;
            toast.success("Created tire service");
          } else {
            throw new Error("Failed to create tire service");
          }
        } catch (serviceError) {
          console.error('Error creating service:', serviceError);
          toast.error('Could not create tire service. Please try again later.');
          setIsSubmitting(false);
          return;
        }
      } else {
        // If we have a service ID, attempt to get its name
        try {
          const serviceResponse = await axios.get(`${import.meta.env.VITE_SERVER_URL}/services/${serviceId}`);
          if (serviceResponse.data.success) {
            serviceName = serviceResponse.data.data.name;
          }
        } catch (err) {
          // If service fetch fails, just use the default name we already set
          console.log("Could not fetch service details, using default name");
        }
      }
      
      // Create the order on the server
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/orders/create`, {
        userId: userId,
        carId: formData.carId,
        services: [{
          service: serviceId,
          serviceName: serviceName,
          price: parseFloat(estimatedPrice)
        }],
        address: {
          fullAddress: formData.vehicleLocation,
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
      serviceType: "tireChange",
      tireCount: "4",
      tireSize: "",
      vehicleLocation: "",
      bookingType: "scheduled",
      scheduledDate: "",
      scheduledTime: "",
      notes: "",
      coordinates: { lng: null, lat: null },
      carId: ""
    })
    setCurrentStep(1)
  }

  const serviceDescriptions = {
    tireChange: "Remove and replace tires with new or seasonal tires.",
    pressureCheck: "Check and adjust the air pressure in all tires to optimal levels.",
    punctureRepair: "Repair punctures or small damages to restore tire integrity.",
  }

  const serviceIcons = {
    tireChange: <RotateCw className="h-6 w-6" />,
    pressureCheck: <Gauge className="h-6 w-6" />,
    punctureRepair: <Wrench className="h-6 w-6" />,
  }

  // Fetch user's cars and tire service
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
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/cars/user/${userId}`)
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
        
        // Fetch the tire service
        const serviceResponse = await axios.get(`${import.meta.env.VITE_SERVER_URL}/services`)
        if (serviceResponse.data.success) {
          const tireService = serviceResponse.data.data.find(service => 
            service.name.toLowerCase().includes('tire')
          )
          
          if (tireService) {
            setTireServiceId(tireService._id)
          } else {
            console.log("Tire service not found, will create one during order")
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
          vehicleLocation: address
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
      vehicleLocation: result.place_name,
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
            <div className="bg-gray-600/20 p-2 rounded-lg">
              <CircleDashed className="h-6 w-6 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Tire Services
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
                    currentStep >= 1 ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Service</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 2 ? "bg-gray-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Details</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 3 ? "bg-gray-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"
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
                <h2 className="text-xl font-semibold text-white">Select Tire Service</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <CircleDashed size={16} className="text-gray-400" />
                    Service Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["tireChange", "pressureCheck", "punctureRepair"].map((type) => (
                      <div
                        key={type}
                        className={`p-4 rounded-lg border ${
                          formData.serviceType === type
                            ? "border-gray-500 bg-gray-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 hover:border-gray-400`}
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.serviceType === type
                                ? "bg-gray-600/30 text-gray-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {serviceIcons[type]}
                          </div>
                          <span className="font-medium capitalize">{type.replace(/([A-Z])/g, " $1").trim()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{serviceDescriptions[type]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Number of Tires (only for tire change and puncture repair) */}
                {(formData.serviceType === "tireChange" || formData.serviceType === "punctureRepair") && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <CircleDashed size={16} className="text-gray-400" />
                      Number of Tires <span className="text-red-400">*</span>
                    </label>

                    <div className="grid grid-cols-4 gap-4">
                      {["1", "2", "3", "4"].map((count) => (
                        <div
                          key={count}
                          className={`p-4 rounded-lg border ${
                            formData.tireCount === count
                              ? "border-gray-500 bg-gray-600/10"
                              : "border-gray-700 bg-gray-800/50"
                          } cursor-pointer transition-all duration-200 hover:border-gray-400 flex items-center justify-center`}
                          onClick={() => setFormData({ ...formData, tireCount: count })}
                        >
                          <span className="font-medium text-lg">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tire Size */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <CircleDashed size={16} className="text-gray-400" />
                    Tire Size (Optional)
                  </label>
                  <input
                    type="text"
                    name="tireSize"
                    value={formData.tireSize}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all duration-200"
                    placeholder="e.g. 205/55R16"
                  />
                  <p className="text-xs text-gray-400">
                    You can find this information on the sidewall of your tire or in your vehicle manual.
                  </p>
                </div>

                {/* Vehicle Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <MapPin size={16} className="text-gray-400" />
                    Vehicle Location <span className="text-red-400">*</span>
                  </label>
                  
                  <div className="space-y-4">
                    {/* Location search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="w-full p-4 pl-12 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all duration-200"
                        placeholder="Search for a location"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {/* Search results dropdown */}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                          {searchResults.map((result) => (
                            <div
                              key={result.id}
                              className="p-3 hover:bg-gray-700 cursor-pointer text-white text-sm border-b border-gray-700 last:border-b-0"
                              onClick={() => handleSearchResultSelect(result)}
                            >
                              <div className="font-medium">{result.text}</div>
                              <div className="text-gray-400 text-xs truncate">{result.place_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Map container */}
                    <div 
                      ref={mapRef} 
                      className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-700"
                    ></div>
                    
                    {/* Selected location display */}
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-300 mb-1">Selected Location:</p>
                      <p className="text-white font-medium break-words">
                        {formData.vehicleLocation || "No location selected"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Car Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Car size={16} className="text-gray-400" />
                    Select Vehicle <span className="text-red-400">*</span>
                  </label>
                  
                  {userCars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userCars.map(car => (
                        <div
                          key={car._id}
                          className={`p-4 rounded-lg border ${
                            formData.carId === car._id
                              ? "border-gray-500 bg-gray-600/10"
                              : "border-gray-700 bg-gray-800/50"
                          } cursor-pointer transition-all duration-200 hover:border-gray-400`}
                          onClick={() => setFormData({ ...formData, carId: car._id })}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{car.year} {car.make} {car.model}</p>
                              <p className="text-sm text-gray-400">{car.licensePlate || "No plate"}</p>
                            </div>
                            {formData.carId === car._id && (
                              <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                      <p className="text-gray-400 text-center">No vehicles found. Please add a vehicle to your profile first.</p>
                    </div>
                  )}
                </div>

                {/* Booking Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Clock size={16} className="text-gray-400" />
                    Booking Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        formData.bookingType === "scheduled"
                          ? "border-gray-500 bg-gray-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-gray-400`}
                      onClick={() => setFormData({ ...formData, bookingType: "scheduled" })}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.bookingType === "scheduled" ? "border-gray-500" : "border-gray-600"
                          }`}
                        >
                          {formData.bookingType === "scheduled" && (
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          )}
                        </div>
                        <span className="font-medium">Scheduled</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-8">Book a specific date and time for your tire service.</p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        formData.bookingType === "on-demand"
                          ? "border-gray-500 bg-gray-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-gray-400`}
                      onClick={() => setFormData({ ...formData, bookingType: "on-demand" })}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.bookingType === "on-demand" ? "border-gray-500" : "border-gray-600"
                          }`}
                        >
                          {formData.bookingType === "on-demand" && (
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          )}
                        </div>
                        <span className="font-medium">On-Demand</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-8">
                        Get your tire service as soon as possible (additional fee applies).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Date and Time (only if scheduled is selected) */}
                {formData.bookingType === "scheduled" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                        <Calendar size={16} className="text-gray-400" />
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all duration-200"
                        required={formData.bookingType === "scheduled"}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                        <Clock size={16} className="text-gray-400" />
                        Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all duration-200"
                        required={formData.bookingType === "scheduled"}
                      />
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <span className="text-gray-400">Notes</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all duration-200"
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
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
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
                        Continue <ArrowRight size={18} />
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
                      <div className="bg-gray-600/20 p-1.5 rounded-md">{serviceIcons[formData.serviceType]}</div>
                      <span className="font-medium text-white capitalize">
                        {formData.serviceType.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  </div>

                  {(formData.serviceType === "tireChange" || formData.serviceType === "punctureRepair") && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Number of Tires:</span>
                      <span className="font-medium text-white">{formData.tireCount}</span>
                    </div>
                  )}

                  {formData.tireSize && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Tire Size:</span>
                      <span className="font-medium text-white">{formData.tireSize}</span>
                    </div>
                  )}

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
                    <span className="text-gray-300">Vehicle Location:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">{formData.vehicleLocation}</span>
                  </div>

                  {formData.notes && (
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-gray-300">Notes:</span>
                      <span className="font-medium text-white max-w-[250px] text-right">{formData.notes}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  {formData.serviceType === "tireChange" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Tire Change:</span>
                      <span className="font-medium text-white">
                        ${25 * Number.parseInt(formData.tireCount)} (${25} x {formData.tireCount})
                      </span>
                    </div>
                  )}

                  {formData.serviceType === "pressureCheck" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Pressure Check:</span>
                      <span className="font-medium text-white">$15</span>
                    </div>
                  )}

                  {formData.serviceType === "punctureRepair" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Puncture Repair:</span>
                      <span className="font-medium text-white">
                        ${20 * Number.parseInt(formData.tireCount)} (${20} x {formData.tireCount})
                      </span>
                    </div>
                  )}

                  {formData.bookingType === "on-demand" && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">On-Demand Fee:</span>
                      <span className="font-medium text-white">$15.00</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-gray-300">${estimatedPrice}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Estimated Duration:</span>
                    <span className="font-medium text-white">{estimatedDuration} minutes</span>
                  </div>
                </div>

                <div className="bg-gray-600/10 border border-gray-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    {formData.serviceType === "tireChange"
                      ? "Please ensure you have the replacement tires available, or let us know in the notes if you need us to bring specific tires."
                      : formData.serviceType === "pressureCheck"
                        ? "Our technicians will check and adjust the pressure in all tires to the manufacturer's recommended levels."
                        : "For puncture repairs, our technicians will assess if the tire can be repaired or needs replacement."}
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
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
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
                      <div className="bg-gray-600/20 p-1.5 rounded-md">{serviceIcons[formData.serviceType]}</div>
                      <span className="font-medium text-white capitalize">
                        {formData.serviceType.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  </div>

                  {(formData.serviceType === "tireChange" || formData.serviceType === "punctureRepair") && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Number of Tires:</span>
                      <span className="font-medium text-white">{formData.tireCount}</span>
                    </div>
                  )}

                  {formData.tireSize && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Tire Size:</span>
                      <span className="font-medium text-white">{formData.tireSize}</span>
                    </div>
                  )}

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
                    <span className="text-gray-300">Vehicle Location:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">{formData.vehicleLocation}</span>
                  </div>

                  {formData.notes && (
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-gray-300">Notes:</span>
                      <span className="font-medium text-white max-w-[250px] text-right">{formData.notes}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-gray-300">${estimatedPrice}</span>
                  </div>
                </div>

                <div className="bg-gray-600/10 border border-gray-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
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
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
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
                    ? "Your tire service has been scheduled. We'll send you a confirmation email with all the details."
                    : "Your on-demand tire service request has been received. Our technician will contact you shortly with an estimated arrival time."}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Service:</span>
                  <span className="font-medium text-white capitalize">
                    {formData.serviceType.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                {(formData.serviceType === "tireChange" || formData.serviceType === "punctureRepair") && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Number of Tires:</span>
                    <span className="font-medium text-white">{formData.tireCount}</span>
                  </div>
                )}
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
                  <span className="font-medium text-white">{formData.vehicleLocation}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="font-bold text-gray-300">${estimatedPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="font-medium text-white">{estimatedDuration} minutes</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNewBooking}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium"
              >
                Book Another Service
              </button>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default TireServicesForm
