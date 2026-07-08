import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { 
  FiSearch, FiBell, FiCalendar, FiHome, FiUser, FiLogOut, 
  FiMenu, FiX, FiShoppingCart, FiHeart, FiBox, FiShoppingBag, FiActivity 
} from "react-icons/fi";

function DashboardLayout({ children, title = "Dashboard" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    if (!user?.id) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get(`/notifications`, {
          params: {
            userId: user.id,
            role: user.role
          }
        });
        const unread = res.data.filter(n => !n.readStatus).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch unread notification count:", err);
      }
    };
    fetchUnreadCount();
    
    // Fetch cart count from localStorage for retailer
    const updateCartCount = () => {
      if (user?.role === "RETAILER") {
        const savedCart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
        setCartCount(savedCart.length);
      }
    };
    updateCartCount();

    const interval = setInterval(fetchUnreadCount, 15000);
    const cartInterval = setInterval(updateCartCount, 2000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cartInterval);
    };
  }, [user]);

  const handleBellClick = () => {
    if (user?.role === "ADMIN") navigate("/admin/notifications");
    else if (user?.role === "FARMER") navigate("/farmer/notifications");
    else if (user?.role === "RETAILER") navigate("/retailer/notifications");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  const isActive = (path) => location.pathname === path;

  // Render Admin Top-Right Navigation
  const renderAdminTopRightNav = () => (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
      <Link 
        to="/" 
        className="text-text-medium hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1"
        title="View Landing Page"
      >
        <FiHome /> Home
      </Link>
      <div className="w-px h-3 bg-gray-250"></div>
      <Link 
        to="/admin/profile" 
        className={`hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1 ${
          isActive('/admin/profile') ? 'text-primary' : 'text-text-medium'
        }`}
      >
        <FiUser /> Profile
      </Link>
      <div className="w-px h-3 bg-gray-250"></div>
      <button 
        onClick={handleLogout}
        className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );

  // Top Navigation bar for Farmer / Retailer
  const renderTopNavbar = () => {
    const isFarmer = user?.role === "FARMER";
    
    const farmerLinks = [
      { to: "/farmer", label: "Dashboard", icon: FiActivity },
      { to: "/farmer/my-products", label: "Products", icon: FiBox },
      { to: "/farmer/orders", label: "Orders", icon: FiShoppingBag },
      { to: "/farmer/profile", label: "Profile", icon: FiUser },
      { to: "/farmer/notifications", label: "Notifications", icon: FiBell, badge: unreadCount },
    ];

    const retailerLinks = [
      { to: "/retailer", label: "Dashboard", icon: FiActivity },
      { to: "/retailer/browse", label: "Browse Products", icon: FiBox },
      { to: "/retailer/browse", label: "Cart", icon: FiShoppingCart, badge: cartCount, state: { openCart: true } },
      { to: "/retailer/orders", label: "Orders", icon: FiShoppingBag },
      { to: "/retailer/browse", label: "Wishlist", icon: FiHeart, state: { showWishlist: true } },
      { to: "/retailer/profile", label: "Profile", icon: FiUser },
      { to: "/retailer/notifications", label: "Notifications", icon: FiBell, badge: unreadCount },
    ];

    const activeLinks = isFarmer ? farmerLinks : retailerLinks;

    return (
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-black text-primary tracking-tight">FarmConnect</span>
          </Link>

          {/* Center: Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {activeLinks.map(link => {
              const active = isActive(link.to) && !link.state;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  state={link.state}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-medium hover:bg-green-50/50 hover:text-primary"
                  }`}
                >
                  <link.icon className="text-base" />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-text-medium font-bold rounded-xl text-sm transition-all"
            >
              <FiHome /> Home
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-650 hover:bg-red-150 font-bold rounded-xl text-sm transition-all border border-red-100"
            >
              <FiLogOut /> Logout
            </button>
          </div>

          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-text-medium hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-gray-50 pt-4 space-y-2 animate-in slide-in-from-top duration-250">
            {activeLinks.map(link => {
              const active = isActive(link.to) && !link.state;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  state={link.state}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active 
                      ? "bg-primary text-white" 
                      : "text-text-medium hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="text-base" />
                    <span>{link.label}</span>
                  </span>
                  {link.badge > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? "bg-white text-primary" : "bg-red-500 text-white"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="h-px bg-gray-100 my-3"></div>
            <div className="flex gap-2 p-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-gray-200 hover:bg-gray-50 text-text-medium font-bold rounded-xl text-sm"
              >
                <FiHome /> Home
              </Link>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-50 text-red-650 rounded-xl font-bold text-sm"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    );
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex h-screen bg-base-cream font-sans flex-col">
      {/* Dynamic Navigation selection */}
      {isAdmin ? (
        <div className="flex h-screen bg-base-cream font-sans w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64 overflow-hidden transition-all duration-300">
            <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shrink-0">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <h1 className="text-2xl font-bold text-text-dark whitespace-nowrap">{title}</h1>
                
                {/* Search Bar */}
                <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <FiSearch className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-text-dark placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-5 w-full md:w-auto justify-end">
                {/* Date Widget */}
                <div className="hidden md:flex items-center gap-2 text-sm text-text-medium font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <FiCalendar className="text-primary" />
                  <span>{today}</span>
                </div>

                {/* Admin Top navigation controls */}
                {renderAdminTopRightNav()}

                <div className="w-px h-6 bg-gray-250 hidden md:block"></div>

                {/* Profile Section */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-text-dark leading-tight">{user?.name || "Admin User"}</p>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{user?.role || "ADMIN"}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white cursor-pointer hover:shadow-lg transition-shadow">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-cream p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden w-full">
          {renderTopNavbar()}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-cream p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;