import React, { useState } from "react";

// Mock toast functionality (you might want to use a library like react-toastify or react-hot-toast)
const toast = {
  success: (message) => alert(`Success: ${message}`),
  error: (message) => alert(`Error: ${message}`)
};

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newOtp = [...otp];

    if (/^\d*$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if a digit is entered
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }

    // Handle backspace
    if (e.key === "Backspace" && !value && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      toast.error("Please enter a 4-digit OTP code");
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP verified successfully!");
      // Redirect or perform further actions
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="w-full lg:w-1/2 hidden lg:block relative">
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col justify-center items-center">
          <div className="text-center p-8">
            <h1 className="text-5xl font-bold text-white mb-4">RideRevive</h1>
            <p className="text-xl text-white mb-8">Vehicle maintenance and emergency services at your doorstep</p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Fuel delivery services</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Car washing at your location</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Emergency towing services</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Battery and maintenance services</span>
              </div>
            </div>
          </div>
        </div>
        <img
          src="/images/car-maintenance.jpg"
          alt="RideRevive Services"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-[#1a1a1a] p-4">
        <div className="w-full max-w-[350px] p-10 bg-[#242424] rounded-lg shadow-2xl text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-6">Enter OTP Code</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleChange(e, index)}
                  maxLength="1"
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#2a2a2a] text-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                      transition-colors duration-200 font-medium"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;