import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car, onDelete }) => (
  <div className="bg-[#2a2a2a] rounded-lg shadow-md overflow-hidden flex flex-col justify-between p-4 transform transition-transform hover:scale-105">
    <div>
      <h2 className="text-lg font-bold text-blue-400">{car.year} {car.make} {car.model}</h2>
      <p className="text-sm text-gray-400">License Plate: {car.licensePlate}</p>
      <p className="text-sm text-gray-400">Color: {car.color}</p>
      <p className="text-sm text-gray-400">Fuel Type: {car.fuelType}</p>
      <p className="text-sm text-gray-400">Transmission: {car.transmission}</p>
      <p className="text-sm text-gray-400">Mileage: {car.mileage} km</p>
    </div>
    <div className="flex justify-between mt-2">
      <button className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors">
        Get Seller Details
      </button>
      <button 
        onClick={() => onDelete(car._id)}
        className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors"
      >
        Delete
      </button>
    </div>
  </div>
);

const CarListingsApp = () => {
  const [carListings, setCarListings] = useState([]);
  const navigate = useNavigate();

  const fetchCars = async () => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken._id;

    try {
      const response = await axios.get(`http://localhost:3000/api/cars/user/${userId}`);
      if (response.data.status) {
        setCarListings(response.data.data); // Set the car listings from the response
        toast.success(response.data.message || "Cars retrieved successfully!");
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to retrieve cars');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('An error occurred while fetching cars');
      }
    }
  };

  useEffect(() => {
    fetchCars(); // Call fetchCars on component mount
  }, []);

  const handleAddClick = () => {
    navigate('/form');
  };

  const handleDelete = async (carId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/cars/${carId}`);
      if (response.data.status) {
        toast.success(response.data.message || "Car deleted successfully!");
        // Fetch the updated list of cars
        fetchCars(); // Call fetchCars to refresh the list
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to delete car');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('An error occurred while deleting the car');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#242424] text-white">
      {/* Sidebar */}

      {/* Main content */}
      <div className="w-full pl-24 p-4">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {carListings.map(car => (
            <CarCard key={car._id} car={car} onDelete={handleDelete} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default CarListingsApp;