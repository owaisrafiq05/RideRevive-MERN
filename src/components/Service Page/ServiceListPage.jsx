import { useNavigate } from 'react-router-dom';

// Importing images with updated filenames
import FuelIcon from '../../Pictures/Fuel_Delivery.png';
import CarWashIcon from '../../Pictures/Car_Washing.png';
import TireIcon from '../../Pictures/Tire_Services.png';
import RescueIcon from '../../Pictures/Emergency_Rescue.png';
import BatteryIcon from '../../Pictures/Car_Battery.png';
import OilIcon from '../../Pictures/Engine_Oil_Services.png';

const ServiceListPage = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Fuel Delivery", path: "/fuel-delivery", icon: FuelIcon },
    { name: "Car Washing", path: "/car-washing", icon: CarWashIcon },
    { name: "Tire Services", path: "/tire-services", icon: TireIcon },
    { name: "Emergency Rescue", path: "/emergency-rescue", icon: RescueIcon },
    { name: "Battery Services", path: "/battery-services", icon: BatteryIcon },
    { name: "Engine Oil Services", path: "/engine-oil-services", icon: OilIcon },
  ];

  return (
    <div className="min-h-screen bg-[#242424] text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Our Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {services.map((service, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center p-6 rounded-lg border-2 border-[#b5bfd9] bg-[#2a2a2a] shadow-lg transition ease-in-out cursor-pointer hover:border-[#2260ff] group"
            onClick={() => navigate(service.path)}
          >
            {/* Icon */}
            <div className="w-16 h-16 mb-4 fill-[#494949] group-hover:fill-[#2260ff]">
              <img src={service.icon} alt={`${service.name} icon`} className="w-full h-full" />
            </div>

            {/* Label */}
            <span className="text-lg text-[#707070] text-center transition duration-300 group-hover:text-[#2260ff]">
              {service.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceListPage;
