import { useState } from "react";

const FuelDeliveryForm = () => {
  const [formData, setFormData] = useState({
    fuelType: "petrol",
    quantity: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#242424] text-white flex flex-col flex-1">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Fuel Delivery</h1>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full">
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#242424] text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g. 123 Main St"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700 flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-transparent hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelDeliveryForm;
