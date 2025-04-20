import React from 'react';

// Sample car data
const carListings = [
  {
    id: 1,
    year: 2015,
    make: "Honda",
    model: "City V MT Petrol BS IV",
    price: "6.45",
    emi: "9,600",
    kilometers: "48000",
    fuel: "Petrol",
    owner: "1st owner",
    location: "Chennai",
    seller: "By Dealer",
    added: "Added Today",
  },
  {
    id: 2,
    year: 2014,
    make: "Honda",
    model: "City V MT Petrol BS IV",
    price: "12.55",
    emi: "9,600",
    kilometers: "48000",
    fuel: "Petrol",
    owner: "1st owner",
    location: "Chennai",
    seller: "By Dealer",
    added: "Added Today",
  },
  {
    id: 3,
    year: 2010,
    make: "Honda",
    model: "City 1.5 S MT",
    price: "3.95",
    emi: "9,600",
    kilometers: "48000",
    fuel: "Petrol",
    owner: "1st owner",
    location: "Chennai",
    seller: "By Dealer",
    added: "Added Today",
  },
  {
    id: 4,
    year: 2018,
    make: "Toyota",
    model: "Corolla Altis",
    price: "9.75",
    emi: "12,800",
    kilometers: "35000",
    fuel: "Petrol",
    owner: "1st owner",
    location: "Bangalore",
    seller: "By Dealer",
    added: "Added Today",
  },
  {
    id: 5,
    year: 2019,
    make: "Hyundai",
    model: "Verna SX",
    price: "8.25",
    emi: "10,500",
    kilometers: "28000",
    fuel: "Diesel",
    owner: "1st owner",
    location: "Mumbai",
    seller: "By Dealer",
    added: "Added Yesterday",
  },
  {
    id: 6,
    year: 2020,
    make: "Ford",
    model: "EcoSport",
    price: "7.50",
    emi: "11,000",
    kilometers: "15000",
    fuel: "Petrol",
    owner: "1st owner",
    location: "Delhi",
    seller: "By Dealer",
    added: "Added Today",
  },
];

const CarCard = ({ car }) => (
  <div className="bg-[#2a2a2a] rounded-lg shadow-md overflow-hidden flex flex-col justify-between h-60 transform transition-transform hover:scale-105">
    {/* <img src="/path/to/car.png" alt="Car" className="w-full h-32 object-cover" /> */}
    <div className="p-2">
      <h2 className="text-sm font-bold text-blue-400">{car.year} {car.make} {car.model}</h2>
      <div className="flex items-baseline space-x-2">
        <span className="text-md font-bold text-white">₹ {car.price} Lakh</span>
        <span className="text-xs text-gray-400">EMI at : ₹ {car.emi}</span>
      </div>
      <ul className="mt-1 text-xs text-gray-400">
        <li>○ {car.kilometers} Kms</li>
        <li>○ {car.fuel}</li>
        <li>○ {car.owner}</li>
        <li>○ {car.location}</li>
        <li>○ {car.seller}</li>
        <li>○ {car.added}</li>
      </ul>
    </div>
    <button className="mt-2 bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors">
      Get Seller Details
    </button>
  </div>
);

const CarListingsApp = () => (
  <div className="flex min-h-screen bg-[#242424] text-white">
    {/* Sidebar */}
    <aside className="w-1/4 p-4 hidden lg:block">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
    </aside>

    {/* Main content */}
    <div className="w-full lg:w-3/4 p-4">
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add
        </button>
      </div>
      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {carListings.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </main>
    </div>
  </div>
);

export default CarListingsApp;