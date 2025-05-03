"use client"

import { useState, useEffect, useRef } from "react"
import {
  Check,
  ChevronLeft,
  ArrowRight,
  AlertTriangle,
  Clock,
  MapPin,
  Car,
  Phone,
  Truck,
  Battery,
  Key,
  Wrench,
  Info,
  MessageSquare,
  User,
  Search
} from "lucide-react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const EmergencyRescueForm = () => {
  const [formData, setFormData] = useState({
    serviceType: "towing",
    vehicleType: "sedan",
    location: "",
    coordinates: { lng: null, lat: null },
    description: "",
    name: "",
    phone: "",
    isVehicleAccessible: "yes",
    carId: ""
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedTime, setEstimatedTime] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [trackingId, setTrackingId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [userCars, setUserCars] = useState([])
  const [userId, setUserId] = useState("") 
  const [rescueServiceId, setRescueServiceId] = useState("") // To store the emergency rescue service ID
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const calculateEstimatedTime = () => {
    // Mock calculation based on service type
    const baseTimes = {
      towing: "30-45",
      jumpStart: "15-25",
      lockout: "20-30",
      flatTire: "25-35",
      fuelDelivery: "25-40",
    }

    return baseTimes[formData.serviceType]
  }
  
  const calculatePrice = () => {
    // Base prices for emergency services
    const basePrices = {
      towing: 80,
      jumpStart: 45,
      lockout: 60,
      flatTire: 55,
      fuelDelivery: 65,
    }
    
    // Apply distance surcharges or vehicle type adjustments could be added here
    let price = basePrices[formData.serviceType]
    
    // Vehicle type surcharges
    if (formData.vehicleType === "suv") price += 15
    if (formData.vehicleType === "truck") price += 25
    
    // Accessibility surcharge
    if (formData.isVehicleAccessible === "no") price += 20
    
    return price
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate prices and times
    setTimeout(() => {
      const time = calculateEstimatedTime()
      const price = calculatePrice()
      setEstimatedTime(time)
      setEstimatedPrice(price)
      setCurrentStep(2)
      setIsLoading(false)
    }, 1500)
  }

  const handleConfirmRequest = async () => {
    // Verify user is authenticated
    const token = Cookies.get("token")
    if (!token) {
      toast.error("You must be logged in to place an emergency request.")
      return
    }
    
    // Check if car is selected - only if we have user cars available
    if (userCars.length > 0 && !formData.carId) {
      toast.error("Please select a vehicle for this service")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let serviceId = rescueServiceId;
      let serviceName = `Emergency ${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)}`;
      
      // If no rescue service ID is available, create one first
      if (!serviceId) {
        try {
          // Create a new emergency rescue service
          const newServiceResponse = await axios.post('http://localhost:3000/api/services', {
            name: serviceName,
            description: 'Emergency rescue services including towing, jump start, lockout assistance, flat tire help, and fuel delivery.',
            category: 'emergency',
            basePrice: calculatePrice(),
            estimatedTime: {
              value: parseInt(estimatedTime.split('-')[0]),
              unit: 'minutes'
            },
            image: 'emergency-service.jpg',
            isActive: true,
            isEmergency: true,
            compatibleVehicleTypes: ['sedan', 'suv', 'truck', 'van', 'hatchback', 'convertible', 'other']
          });
          
          if (newServiceResponse.data.success) {
            serviceId = newServiceResponse.data.data._id;
            toast.success("Created emergency service");
          } else {
            throw new Error("Failed to create emergency service");
          }
        } catch (serviceError) {
          console.error('Error creating service:', serviceError);
          toast.error('Could not create emergency service. Please try again later.');
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
      
      // Extract service details for the admin panel
      const serviceDetails = {
        serviceType: formData.serviceType,
        vehicleType: formData.vehicleType,
        isVehicleAccessible: formData.isVehicleAccessible,
        emergencyInfo: {
          description: formData.description,
          estimatedResponse: estimatedTime
        },
        contactInfo: {
          name: formData.name,
          phone: formData.phone
        },
        estimatedPrice: estimatedPrice
      };
      
      // Create the order on the server
      const response = await axios.post('http://localhost:3000/api/orders/create', {
        userId: userId,
        carId: formData.carId || null, // Allow nullable for emergencies
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
        scheduledDate: new Date(), // Emergency services are always immediate
        specialInstructions: formData.description,
        contactName: formData.name,
        contactPhone: formData.phone,
        isEmergency: true,
        paymentMethod: 'credit_card', // Default payment method
        paymentStatus: 'pending' // For emergencies, payment is handled later
      });
      
      if (response.data.success) {
        toast.success("Your emergency request has been submitted!");
        // Generate tracking ID and show confirmation screen
        const trackingId = `ER-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        setTrackingId(trackingId);
        setCurrentStep(3);
      } else {
        throw new Error(response.data.message || 'Failed to submit emergency request');
      }
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again or call customer service.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNewRequest = () => {
    setFormData({
      serviceType: "towing",
      vehicleType: "sedan",
      location: "",
      coordinates: { lng: null, lat: null },
      description: "",
      name: "",
      phone: "",
      isVehicleAccessible: "yes",
      carId: ""
    })
    setCurrentStep(1)
  }

  // Fetch user's cars and rescue service 
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      const token = Cookies.get("token")
      if (token) {
        try {
          const decodedToken = jwtDecode(token)
          const userId = decodedToken._id
          setUserId(userId)
      
          // Fetch user's cars if they're logged in
          const response = await axios.get(`http://localhost:3000/api/cars/user/${userId}`)
          if (response.data.success) {
            setUserCars(response.data.data)
          } else if (response.data.status) {
            // Fallback for API that might use status instead of success
            setUserCars(response.data.data)
          }
          
          // Fetch emergency rescue services
          const serviceResponse = await axios.get("http://localhost:3000/api/services")
          if (serviceResponse.data.success) {
            const rescueService = serviceResponse.data.data.find(service => 
              service.name.toLowerCase().includes('emergency') || 
              service.category === 'emergency'
            )
            
            if (rescueService) {
              setRescueServiceId(rescueService._id)
            } else {
              console.log("Emergency service not found, will create one during order")
            }
          } else {
            console.log("Failed to retrieve services")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      setIsLoading(false)
    }
  
    fetchUserData()
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

  const serviceDescriptions = {
    towing: "Vehicle transport to a repair facility or location of your choice.",
    jumpStart: "Battery jump start service to get your vehicle running again.",
    lockout: "Assistance when locked out of your vehicle.",
    flatTire: "Help with changing a flat tire or temporary repair.",
    fuelDelivery: "Emergency fuel delivery when you run out of gas.",
  }

  const serviceIcons = {
    towing: <Truck className="h-6 w-6" />,
    jumpStart: <Battery className="h-6 w-6" />,
    lockout: <Key className="h-6 w-6" />,
    flatTire: <Wrench className="h-6 w-6" />,
    fuelDelivery: <Truck className="h-6 w-6" />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col flex-1">
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/20 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Emergency Rescue
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
                    currentStep >= 1 ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Service</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 2 ? "bg-red-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
                <span className="text-sm mt-2 text-gray-300">Details</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-gray-800">
                <div
                  className={`h-full ${currentStep >= 3 ? "bg-red-600" : "bg-gray-800"}`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2 text-gray-300">Dispatch</span>
              </div>
            </div>
          </div>

          {/* Emergency Alert Banner */}
          {currentStep === 1 && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300 mb-1">Emergency Services</p>
                <p className="text-sm text-gray-300">
                  If you're in immediate danger, please call emergency services at{" "}
                  <span className="font-bold text-white">911</span> first.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Select Emergency Service</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <AlertTriangle size={16} className="text-red-400" />
                    Service Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "towing", label: "Towing" },
                      { id: "jumpStart", label: "Jump Start" },
                      { id: "lockout", label: "Lockout Assistance" },
                      { id: "flatTire", label: "Flat Tire" },
                      { id: "fuelDelivery", label: "Fuel Delivery" },
                    ].map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 rounded-lg border ${
                          formData.serviceType === service.id
                            ? "border-red-500 bg-red-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 hover:border-red-400`}
                        onClick={() => setFormData({ ...formData, serviceType: service.id })}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.serviceType === service.id
                                ? "bg-red-600/30 text-red-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {serviceIcons[service.id]}
                          </div>
                          <span className="font-medium">{service.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{serviceDescriptions[service.id]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Car size={16} className="text-red-400" />
                    Vehicle Type <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "sedan", label: "Sedan/Hatchback" },
                      { id: "suv", label: "SUV/Crossover" },
                      { id: "truck", label: "Truck/Van" },
                      { id: "motorcycle", label: "Motorcycle" },
                      { id: "commercial", label: "Commercial Vehicle" },
                      { id: "other", label: "Other" },
                    ].map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 rounded-lg border ${
                          formData.vehicleType === type.id
                            ? "border-red-500 bg-red-600/10"
                            : "border-gray-700 bg-gray-800/50"
                        } cursor-pointer transition-all duration-200 hover:border-red-400 flex items-center gap-3`}
                        onClick={() => setFormData({ ...formData, vehicleType: type.id })}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.vehicleType === type.id ? "border-red-500" : "border-gray-600"
                          }`}
                        >
                          {formData.vehicleType === type.id && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                        </div>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Accessibility */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Info size={16} className="text-red-400" />
                    Is your vehicle accessible by a tow truck? <span className="text-red-400">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        formData.isVehicleAccessible === "yes"
                          ? "border-red-500 bg-red-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-red-400 flex items-center gap-3`}
                      onClick={() => setFormData({ ...formData, isVehicleAccessible: "yes" })}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.isVehicleAccessible === "yes" ? "border-red-500" : "border-gray-600"
                        }`}
                      >
                        {formData.isVehicleAccessible === "yes" && (
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <span className="font-medium">Yes, it's accessible</span>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        formData.isVehicleAccessible === "no"
                          ? "border-red-500 bg-red-600/10"
                          : "border-gray-700 bg-gray-800/50"
                      } cursor-pointer transition-all duration-200 hover:border-red-400 flex items-center gap-3`}
                      onClick={() => setFormData({ ...formData, isVehicleAccessible: "no" })}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.isVehicleAccessible === "no" ? "border-red-500" : "border-gray-600"
                        }`}
                      >
                        {formData.isVehicleAccessible === "no" && (
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <span className="font-medium">No, it's in a difficult location</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <MapPin size={16} className="text-red-400" />
                    Your Location <span className="text-red-400">*</span>
                  </label>
                  
                  <div className="space-y-4">
                    {/* Location search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="w-full p-4 pl-12 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                        placeholder="Search for your location"
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

                {/* Select Car - only show if user has cars */}
                {userCars.length > 0 && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Car size={16} className="text-red-400" />
                      Select Your Vehicle <span className="text-red-400">*</span>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userCars.map(car => (
                        <div
                          key={car._id}
                          className={`p-4 rounded-lg border ${
                            formData.carId === car._id
                              ? "border-red-500 bg-red-600/10"
                              : "border-gray-700 bg-gray-800/50"
                          } cursor-pointer transition-all duration-200 hover:border-red-400`}
                          onClick={() => setFormData({ ...formData, carId: car._id })}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{car.year} {car.make} {car.model}</p>
                              <p className="text-sm text-gray-400">{car.licensePlate || "No plate"}</p>
                            </div>
                            {formData.carId === car._id && (
                              <div className="h-6 w-6 bg-red-600 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <MessageSquare size={16} className="text-red-400" />
                    Describe Your Emergency
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                    placeholder="Provide details about your situation to help us prepare"
                    rows={3}
                  ></textarea>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <User size={16} className="text-red-400" />
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                      <Phone size={16} className="text-red-400" />
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                      placeholder="Enter your phone number"
                      required
                    />
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
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg 
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

          {/* Step 2: Review Details */}
          {currentStep === 2 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Review Emergency Details</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-300 mb-1">Estimated Response Time</p>
                    <p className="text-sm text-gray-300">
                      A rescue vehicle will be dispatched to your location with an estimated arrival time of{" "}
                      <span className="font-bold text-white">{estimatedTime} minutes</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Service Type:</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-600/20 p-1.5 rounded-md">{serviceIcons[formData.serviceType]}</div>
                      <span className="font-medium text-white">
                        {formData.serviceType === "jumpStart"
                          ? "Jump Start"
                          : formData.serviceType === "flatTire"
                            ? "Flat Tire"
                            : formData.serviceType === "fuelDelivery"
                              ? "Fuel Delivery"
                              : formData.serviceType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Vehicle Type:</span>
                    <span className="font-medium text-white capitalize">{formData.vehicleType}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Vehicle Accessible:</span>
                    <span className="font-medium text-white">
                      {formData.isVehicleAccessible === "yes" ? "Yes" : "No, difficult location"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <span className="text-gray-300">Location:</span>
                    <span className="font-medium text-white max-w-[250px] text-right">{formData.location}</span>
                  </div>

                  {formData.description && (
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-gray-300">Description:</span>
                      <span className="font-medium text-white max-w-[250px] text-right">{formData.description}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Contact Name:</span>
                    <span className="font-medium text-white">{formData.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Contact Phone:</span>
                    <span className="font-medium text-white">{formData.phone}</span>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-white">Estimated Response Time:</span>
                    <span className="text-xl font-bold text-red-400">{estimatedTime} minutes</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    This is an estimate based on current conditions. Actual response time may vary.
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
                    onClick={handleConfirmRequest}
                    disabled={isLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg 
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
                        Confirm & Dispatch <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dispatch Confirmation */}
          {currentStep === 3 && (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl text-center">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Help is on the way!</h2>
                <p className="text-gray-300 max-w-md">
                  Your emergency rescue request has been dispatched. A service provider will contact you shortly.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Tracking ID:</span>
                  <span className="font-medium text-white">{trackingId}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Service:</span>
                  <span className="font-medium text-white">
                    {formData.serviceType === "jumpStart"
                      ? "Jump Start"
                      : formData.serviceType === "flatTire"
                        ? "Flat Tire"
                        : formData.serviceType === "fuelDelivery"
                          ? "Fuel Delivery"
                          : formData.serviceType}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Estimated Arrival:</span>
                  <span className="font-medium text-white">{estimatedTime} minutes</span>
                </div>
                <div className="border-t border-gray-700 my-4"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Emergency Contact:</span>
                  <span className="font-medium text-white">1-800-555-0123</span>
                </div>
              </div>

              <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 mb-8 text-left">
                <Phone className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">Stay by your phone</p>
                  <p className="text-sm text-gray-300">
                    Keep your phone nearby. The rescue team will call you when they're on the way and may need
                    additional information.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  type="button"
                  onClick={handleNewRequest}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium"
                >
                  New Request
                </button>
                <button
                  type="button"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium"
                >
                  Track Rescue Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default EmergencyRescueForm
