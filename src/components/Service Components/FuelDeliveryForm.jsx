"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Fuel, 
  MapPin, 
  Droplets, 
  CreditCard, 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  Truck, 
  DollarSign, 
  Search, 
  Car, 
  Calendar, 
  MessageSquare 
} from "lucide-react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const FuelDeliveryForm = () => {
  const [formData, setFormData] = useState({
    fuelType: "petrol",
    quantity: "",
    location: "",
    coordinates: { lng: null, lat: null },
    carId: "",
    scheduledDate: new Date().toISOString().split('T')[0], // Today's date as default
    specialInstructions: ""
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [userCars, setUserCars] = useState([])
  const [userId, setUserId] = useState("") 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fuelServiceId, setFuelServiceId] = useState("") // To store the fuel service ID
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  
  // Fetch user's cars and fuel service
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
        
        // Fetch the fuel delivery service
        const serviceResponse = await axios.get("http://localhost:3000/api/services")
        if (serviceResponse.data.success) {
          const fuelService = serviceResponse.data.data.find(service => 
            service.name.toLowerCase().includes('fuel')
          )
          
          if (fuelService) {
            setFuelServiceId(fuelService._id)
          } else {
            toast.error("Fuel delivery service not found")
          }
        } else {
          toast.error("Failed to retrieve services")
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
    
    // Validate required fields
    if (!formData.quantity) {
      toast.error('Please specify the fuel quantity');
      return;
    }
    
    if (!formData.location || !formData.coordinates.lng || !formData.coordinates.lat) {
      toast.error('Please select a delivery location');
      return;
    }
    
    if (!formData.carId) {
      toast.error('Please select a vehicle');
      return;
    }
    
    if (userCars.length === 0) {
      toast.error('You need to add a vehicle to your profile first');
      return;
    }
    
    setIsLoading(true)
    
    // Calculate price
    const price = calculatePrice()
    setEstimatedPrice(price)
    setCurrentStep(2)
    setIsLoading(false)
    
    toast.success('Price calculated successfully!');
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
    
    setIsSubmitting(true)
    
    try {
      let serviceId = fuelServiceId;
      let serviceName = `${formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1)} Fuel Delivery`;
      
      // If no fuel service ID is available, create one first
      if (!serviceId) {
        try {
          // Create a new fuel delivery service
          const newServiceResponse = await axios.post('http://localhost:3000/api/services', {
            name: serviceName,
            description: 'Emergency fuel delivery service for vehicles that have run out of gas.',
            category: 'other',
            basePrice: 30.00,
            estimatedTime: {
              value: 30,
              unit: 'minutes'
            },
            image: 'fuel-delivery.jpg',
            isActive: true,
            compatibleVehicleTypes: ['sedan', 'suv', 'truck', 'van', 'hatchback', 'convertible', 'other']
          });
          
          if (newServiceResponse.data.success) {
            serviceId = newServiceResponse.data.data._id;
            toast.success("Created fuel delivery service");
          } else {
            throw new Error("Failed to create fuel service");
          }
        } catch (serviceError) {
          console.error('Error creating service:', serviceError);
          toast.error('Could not create fuel delivery service. Please try again later.');
          setIsSubmitting(false);
          return;
        }
      } else {
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
      }
      
      // Create the order on the server
      const response = await axios.post('http://localhost:3000/api/orders/create', {
        userId: userId,
        carId: formData.carId,
        services: [{
          service: serviceId,
          serviceName: serviceName,
          price: parseFloat(estimatedPrice)
        }],
        address: {
          fullAddress: formData.location,
          coordinates: formData.coordinates
        },
        totalAmount: parseFloat(estimatedPrice),
        scheduledDate: formData.scheduledDate,
        specialInstructions: formData.specialInstructions,
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

  const handleNewOrder = () => {
    setFormData({
      fuelType: "petrol",
      quantity: "",
      location: "",
      coordinates: { lng: null, lat: null },
      carId: "",
      scheduledDate: new Date().toISOString().split('T')[0],
      specialInstructions: ""
    })
    setCurrentStep(1)
  }

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

                  {/* Car Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Car size={16} className="text-amber-400" />
                      Select Your Vehicle <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="carId"
                      value={formData.carId}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200"
                      required
                      disabled={isLoading}
                    >
                      <option value="" disabled>
                        {isLoading ? "Loading vehicles..." : "Select your vehicle"}
                      </option>
                      {userCars.map(car => (
                        <option key={car._id} value={car._id}>
                          {car.make} {car.model} ({car.year}) - {car.licenseNumber}
                        </option>
                      ))}
                    </select>
                    {isLoading && (
                      <div className="flex justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-amber-500 rounded-full border-t-transparent"></div>
                      </div>
                    )}
                    {!isLoading && userCars.length === 0 && (
                      <p className="text-amber-400 text-sm flex items-center gap-2">
                        <span className="bg-amber-400/20 p-1 rounded">
                          <Car size={12} className="text-amber-400" />
                        </span>
                        No cars found. Please add a car to your profile first.
                      </p>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Calendar size={16} className="text-amber-400" />
                      Scheduled Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]} // Cannot select dates in the past
                      className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <MessageSquare size={16} className="text-amber-400" />
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      placeholder="Any special instructions for delivery..."
                      className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <MapPin size={16} className="text-amber-400" />
                      Delivery Location <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          id="location-search"
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          className="w-full p-4 pl-12 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200"
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
                          {formData.location || "No location selected"}
                        </p>
                      </div>
                    </div>
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

          {/* Step 3: Checkout */}
          {currentStep === 3 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Complete Your Order</h2>
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Selected Vehicle:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">
                      {userCars.find(car => car._id === formData.carId)?.make} {userCars.find(car => car._id === formData.carId)?.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Scheduled Date:</span>
                    <span className="font-medium text-white">{new Date(formData.scheduledDate).toLocaleDateString()}</span>
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

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4">
                  <h3 className="text-lg font-medium text-white mb-2">Payment Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="**** **** **** ****" 
                      className="w-full p-3 rounded-md bg-gray-700/50 border border-gray-600 text-white"
                      disabled
                      value="4242 4242 4242 4242" // Dummy value
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full p-3 rounded-md bg-gray-700/50 border border-gray-600 text-white"
                        disabled
                        value="12/25" // Dummy value
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">CVC</label>
                      <input 
                        type="text" 
                        placeholder="***" 
                        className="w-full p-3 rounded-md bg-gray-700/50 border border-gray-600 text-white"
                        disabled
                        value="123" // Dummy value
                      />
                    </div>
                  </div>

                  <p className="text-xs text-amber-400 mt-2">
                    Note: This is a demo application. No actual payment will be processed.
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
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg 
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

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default FuelDeliveryForm
