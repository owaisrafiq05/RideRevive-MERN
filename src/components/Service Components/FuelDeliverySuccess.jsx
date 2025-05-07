import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';

const FuelDeliverySuccess = () => {
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate('/fuel-delivery');
        return;
      }

      try {
        // Fetch order details from session ID
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/orders/session/${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setOrderDetails(data.data);
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600/20 p-2 rounded-lg">
              <Check className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Payment Successful
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-gray-300">Verifying your payment...</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-[#2a2a2a] p-8 rounded-xl border border-gray-800 shadow-xl text-center">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                <p className="text-gray-300 max-w-md">
                  Your fuel delivery order has been confirmed. Our driver will contact you shortly with the estimated
                  arrival time.
                </p>
              </div>

              {orderDetails && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Order ID:</span>
                    <span className="font-medium text-white">{orderDetails._id}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Status:</span>
                    <span className="font-medium text-white capitalize">{orderDetails.status}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Total Amount:</span>
                    <span className="font-bold text-amber-400">${orderDetails.totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Scheduled Date:</span>
                    <span className="font-medium text-white">
                      {new Date(orderDetails.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/fuel-delivery')}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> Back to Fuel Delivery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelDeliverySuccess; 