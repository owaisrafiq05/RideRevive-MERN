"use client"

import { useNavigate } from "react-router-dom"

// Importing images with updated filenames
import FuelIcon from "../../Pictures/Fuel_Delivery.png"
import CarWashIcon from "../../Pictures/Car_Washing.png"
import TireIcon from "../../Pictures/Tire_Services.png"
import RescueIcon from "../../Pictures/Emergency_Rescue.png"
import BatteryIcon from "../../Pictures/Car_Battery.png"
import OilIcon from "../../Pictures/Engine_Oil_Services.png"

const ServiceListPage = () => {
  const navigate = useNavigate()

  const services = [
    {
      name: "Fuel Delivery",
      path: "/fuel-delivery",
      icon: FuelIcon,
      description: "Emergency fuel delivery when you're stranded",
      color: "from-amber-600/20 to-amber-700/20",
      borderColor: "amber-500",
    },
    {
      name: "Car Washing",
      path: "/car-washing",
      icon: CarWashIcon,
      description: "Professional cleaning services for your vehicle",
      color: "from-blue-600/20 to-blue-700/20",
      borderColor: "blue-500",
    },
    {
      name: "Tire Services",
      path: "/tire-services",
      icon: TireIcon,
      description: "Tire replacement, repair and maintenance",
      color: "from-gray-600/20 to-gray-700/20",
      borderColor: "gray-500",
    },
    {
      name: "Emergency Rescue",
      path: "/emergency-rescue",
      icon: RescueIcon,
      description: "24/7 roadside assistance and towing services",
      color: "from-red-600/20 to-red-700/20",
      borderColor: "red-500",
    },
    {
      name: "Battery Services",
      path: "/battery-services",
      icon: BatteryIcon,
      description: "Battery replacement and jump-start services",
      color: "from-green-600/20 to-green-700/20",
      borderColor: "green-500",
    },
    {
      name: "Engine Oil Services",
      path: "/engine-oil-services",
      icon: OilIcon,
      description: "Oil changes and fluid maintenance services",
      color: "from-purple-600/20 to-purple-700/20",
      borderColor: "purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col items-center p-8 pl-32">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional automotive services to keep your vehicle running smoothly and handle any emergency situations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(service.path)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
              ></div>

              <div className="relative flex flex-col h-full p-6 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm group-hover:border-blue-500 transition-all duration-300">
                {/* Top section with icon and name */}
                <div className="flex items-center mb-4">
                  <div
                    className={`w-14 h-14 p-2.5 rounded-lg bg-gradient-to-br ${service.color} mr-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <img
                      src={service.icon || "/placeholder.svg"}
                      alt={`${service.name} icon`}
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    {service.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">
                  {service.description}
                </p>

                {/* Bottom action indicator */}
                <div className="mt-auto flex justify-end">
                  <span className="text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                    Learn more →
                  </span>
                </div>

                {/* Decorative corner accent */}
                <div
                  className={`absolute bottom-0 right-0 w-12 h-12 -mb-2 -mr-2 rounded-tl-xl bg-${service.borderColor}/10 group-hover:bg-blue-500/20 transition-colors duration-300`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServiceListPage
