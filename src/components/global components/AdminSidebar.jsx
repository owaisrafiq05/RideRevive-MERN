import { useState, useEffect } from "react";
import { 
  FiHome, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiUsers, 
  FiShoppingBag
} from "react-icons/fi";
import { FaCarAlt, FaFileInvoiceDollar, FaChartBar } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLink, setActiveLink] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/orders")) {
      setActiveLink("orders");
    } else if (path.includes("/admin/users")) {
      setActiveLink("users");
    } else if (path.includes("/admin/vehicles")) {
      setActiveLink("vehicles");
    } else if (path.includes("/admin/reports")) {
      setActiveLink("reports");
    } else if (path.includes("/admin/settings")) {
      setActiveLink("settings");
    } else {
      setActiveLink("dashboard");
    }
  }, [location]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsOpen(window.innerWidth >= 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar') && !event.target.closest('.toggle-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
      path: "/admin"
    },
    {
      id: "orders",
      title: "Orders",
      icon: <FiShoppingBag className="w-5 h-5" />,
      path: "/admin/orders"
    }
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout('admin');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="toggle-button fixed z-40 bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar fixed top-0 left-0 h-full z-30 bg-gradient-to-b from-[#1a1a1a] to-[#242424] text-white shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <FaFileInvoiceDollar className="w-8 h-8 text-blue-500" />
              <h1 className={`text-xl font-bold ${!isOpen && "lg:hidden"}`}>RideRevive</h1>
            </div>
            <button
              className="ml-auto text-gray-400 hover:text-white lg:hidden"
              onClick={toggleSidebar}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-grow py-6 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeLink === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setActiveLink(item.id)}
                >
                  <span>{item.icon}</span>
                  <span className={`ml-3 ${!isOpen && "lg:hidden"}`}>
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors w-full"
            >
              <FiLogOut className="w-5 h-5" />
              <span className={`ml-3 ${!isOpen && "lg:hidden"}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 