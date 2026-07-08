import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  FiSearch, FiFilter, FiBox, FiStar, FiChevronDown, FiChevronUp, 
  FiShoppingCart, FiCheckCircle, FiXCircle, FiHeart, FiTrash2, 
  FiMapPin, FiAward, FiTag, FiShoppingBag 
} from "react-icons/fi";

function BrowseProducts() {
  const { user } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [orderStatus, setOrderStatus] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [reviews, setReviews] = useState({}); // productId -> reviews[]
  const [reviewsOpen, setReviewsOpen] = useState({}); // productId -> bool

  // Wishlist and Cart States
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Initialize wishlist and cart from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`)) || [];
      const savedCart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
      setWishlist(savedWishlist);
      setCart(savedCart);
    }
  }, [user]);

  // Handle Location state navigation triggers
  useEffect(() => {
    if (location.state?.openCart) {
      setCartOpen(true);
      setShowOnlyWishlist(false);
    } else if (location.state?.showWishlist) {
      setShowOnlyWishlist(true);
      setCartOpen(false);
    } else {
      setShowOnlyWishlist(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/products/all";
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (category) params.append("category", category);
      
      if (params.toString()) {
         url = "/products/filter?" + params.toString();
      }
      
      const res = await axiosInstance.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Wishlist
  const toggleWishlist = (productId) => {
    let updatedWishlist = [...wishlist];
    if (updatedWishlist.includes(productId)) {
      updatedWishlist = updatedWishlist.filter(id => id !== productId);
      showToast("Removed from Wishlist");
    } else {
      updatedWishlist.push(productId);
      showToast("Added to Wishlist! ❤️");
    }
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
  };

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Add item to cart
  const addToCart = (product) => {
    const qty = parseInt(quantities[product.id] || 1);
    if (!qty || qty < 1) {
      showToast("Please enter a valid quantity.");
      return;
    }
    if (qty > product.quantity) {
      showToast("Requested quantity exceeds available stock!");
      return;
    }

    let updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantity + qty;
      if (newQty > product.quantity) {
        showToast("Cannot add. Total cart quantity exceeds available stock!");
        return;
      }
      updatedCart[existingIndex].quantity = newQty;
    } else {
      updatedCart.push({ product, quantity: qty });
    }

    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
    showToast(`Added ${qty} ${product.unit || 'kg'} of ${product.productName} to Cart! 🛒`);
    
    // Reset individual qty input
    setQuantities(prev => ({ ...prev, [product.id]: "" }));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
    showToast("Removed item from cart.");
  };

  // Update cart item quantity
  const updateCartQty = (productId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      showToast("Cannot exceed available stock limit!");
      return;
    }
    const updatedCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity: newQty } : item
    );
    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
  };

  // Place single immediate order
  const handleOrder = async (product) => {
    const qty = parseInt(quantities[product.id] || 1);
    if (!qty || qty < 1) return;
    setOrderStatus((prev) => ({ ...prev, [product.id]: "loading" }));
    try {
      await axiosInstance.post("/orders/place", {
        productId: product.id,
        retailerId: user.id,
        quantity: qty,
        totalPrice: qty * product.price,
      });
      setOrderStatus((prev) => ({ ...prev, [product.id]: "success" }));
      
      showToast("Order Placed Successfully! Farmer has been notified.");
      
      // Update local stock immediately
      setProducts(products.map(p => p.id === product.id ? { ...p, quantity: p.quantity - qty } : p));
      setTimeout(() => {
        setOrderStatus((prev) => ({ ...prev, [product.id]: "" }));
      }, 3000);
      
    } catch (err) {
      setOrderStatus((prev) => ({ ...prev, [product.id]: "error" }));
      showToast("Failed to place order. " + (err.response?.data || ""));
      setTimeout(() => {
        setOrderStatus((prev) => ({ ...prev, [product.id]: "" }));
      }, 3000);
    }
  };

  // Cart Checkout (bulk order placement)
  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    let successCount = 0;

    for (const item of cart) {
      try {
        await axiosInstance.post("/orders/place", {
          productId: item.product.id,
          retailerId: user.id,
          quantity: item.quantity,
          totalPrice: item.quantity * item.product.price,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to place order for product ${item.product.productName}:`, err);
      }
    }

    if (successCount === cart.length) {
      showToast("All orders placed successfully! 🎉");
      setCart([]);
      localStorage.removeItem(`cart_${user.id}`);
      setCartOpen(false);
      fetchProducts(); // Refresh stock
    } else if (successCount > 0) {
      showToast(`Placed ${successCount} of ${cart.length} orders successfully.`);
      const remainingCart = cart.slice(successCount);
      setCart(remainingCart);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(remainingCart));
      fetchProducts();
    } else {
      showToast("Failed to checkout items. Please try again.");
    }
    setCheckingOut(false);
  };

  const toggleReviews = async (productId) => {
    const isOpen = reviewsOpen[productId];
    setReviewsOpen(prev => ({ ...prev, [productId]: !isOpen }));
    if (!reviews[productId]) {
      try {
        const res = await axiosInstance.get(`/feedback/product/${productId}`);
        setReviews(prev => ({ ...prev, [productId]: res.data }));
      } catch {
        setReviews(prev => ({ ...prev, [productId]: [] }));
      }
    }
  };

  const avgRating = (fbs) => fbs?.length ? (fbs.reduce((s,f) => s+f.rating, 0)/fbs.length).toFixed(1) : null;
  const stars = (n) => "★".repeat(n) + "☆".repeat(5-n);

  // Filter products by wishlist if toggled
  const displayedProducts = showOnlyWishlist 
    ? products.filter(p => wishlist.includes(p.id))
    : products;

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <DashboardLayout title="Browse Products">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">Available Market</h2>
          <p className="text-text-medium">Find the freshest produce directly from verified farmers.</p>
        </div>
        
        <div className="flex gap-3">
          {/* Wishlist filter toggle */}
          <button 
            onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
            className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${
              showOnlyWishlist 
                ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                : "bg-white border-gray-200 text-text-medium hover:bg-gray-50"
            }`}
          >
            <FiHeart className={showOnlyWishlist ? "fill-red-500 text-red-500" : ""} />
            {showOnlyWishlist ? "Show All Crops" : "My Wishlist"}
          </button>

          {/* Floating Cart Button */}
          <button 
            onClick={() => setCartOpen(true)}
            className="relative px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-primary/20 hover:bg-green-600 transition-colors"
          >
            <FiShoppingCart />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center font-extrabold animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-24 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl font-bold z-50 animate-in slide-in-from-right-10 flex items-center gap-3">
          {toastMessage.includes("Failed") || toastMessage.includes("Removed") ? (
            <FiXCircle className="text-red-400 text-xl" />
          ) : (
            <FiCheckCircle className="text-green-400 text-xl" />
          )}
          {toastMessage}
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark outline-none"
            />
          </div>
          <div className="flex-1 relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark appearance-none outline-none"
            >
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <FiChevronDown />
            </div>
          </div>
          <button 
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-primary/30 hover:bg-green-600 transition-colors whitespace-nowrap flex items-center justify-center gap-2" 
            onClick={fetchProducts}
          >
            <FiSearch /> Search
          </button>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-6xl mb-4 text-gray-200"><FiSearch /></div>
          <h3 className="text-xl font-bold text-text-dark mb-2">No products found</h3>
          <p className="text-text-medium">
            {showOnlyWishlist ? "Your wishlist is currently empty." : "Try adjusting your search filters or check back later."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
          {displayedProducts.map((p) => {
            const fbs = reviews[p.id] || [];
            const avg = avgRating(fbs);
            const isOpen = reviewsOpen[p.id];
            const isWishlisted = wishlist.includes(p.id);
            const isBestSeller = p.quantity > 150; // tag high stock items
            
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative">
                {/* Wishlist Heart Button overlay */}
                <button 
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-3 left-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiHeart className={`text-lg ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </button>

                {p.imageUrl ? (
                  <div className="h-44 overflow-hidden relative bg-gray-50">
                    <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isBestSeller && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <FiAward /> Best Seller
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-44 bg-gray-50 flex items-center justify-center text-gray-300 relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                    <FiBox size={48} />
                    {isBestSeller && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <FiAward /> Best Seller
                      </span>
                    )}
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2">{p.category}</span>
                    <h4 className="text-lg font-bold text-text-dark leading-tight">{p.productName}</h4>
                  </div>
                  
                  {/* Farmer profile badge info */}
                  <div className="flex items-center gap-2 mb-3 mt-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {p.farmerName?.charAt(0) || "F"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-text-dark truncate leading-none">{p.farmerName || "Farmer"}</p>
                        {p.farmerVerified && (
                          <span className="text-blue-500 text-xs" title="Verified Farmer">✔</span>
                        )}
                      </div>
                      {p.farmerDistrict && (
                        <p className="text-[10px] text-text-medium flex items-center gap-0.5 mt-0.5">
                          <FiMapPin className="text-[9px]" /> {p.farmerDistrict}, {p.farmerState || ""}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-4 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-text-medium mb-1">Available Stock</div>
                      <div className="font-bold text-text-dark">{p.quantity} <span className="text-xs font-normal text-text-medium">{p.unit || 'kg'}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-medium mb-1">Price</div>
                      <div className="font-bold text-green-600 text-xl leading-none">₹{p.price}<span className="text-xs font-normal text-text-medium">/{p.unit || 'kg'}</span></div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <div className="relative w-20 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max={p.quantity}
                        placeholder="Qty"
                        value={quantities[p.id] || ""}
                        onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark text-center font-bold h-full outline-none text-sm"
                      />
                    </div>
                    
                    {/* Add to Cart icon button */}
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.quantity === 0}
                      className="p-2 border border-gray-200 rounded-lg text-text-medium hover:text-primary hover:bg-green-50 transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                      title="Add to Cart"
                    >
                      <FiShoppingCart className="text-lg" />
                    </button>

                    <button
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${
                        p.quantity === 0 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : orderStatus[p.id] === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-primary text-white hover:bg-green-600 shadow-md shadow-primary/20"
                      }`}
                      onClick={() => handleOrder(p)}
                      disabled={orderStatus[p.id] === "loading" || p.quantity === 0}
                    >
                      {orderStatus[p.id] === "loading" ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : orderStatus[p.id] === "success" ? (
                        <><FiCheckCircle /> Ordered!</>
                      ) : p.quantity === 0 ? (
                        "Out of Stock"
                      ) : (
                        <><FiShoppingBag /> Instant Buy</>
                      )}
                    </button>
                  </div>

                  {/* Reviews Toggle */}
                  <div className="border-t border-gray-100 pt-3">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 text-text-dark hover:bg-gray-100 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-gray-100"
                      onClick={() => toggleReviews(p.id)}
                    >
                      {isOpen ? (
                        <><FiChevronUp /> Hide Reviews</>
                      ) : (
                        <><FiStar className="text-orange-400" /> Reviews {avg && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{avg}</span>}</>
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
                      {fbs.length === 0 ? (
                        <p className="text-xs text-center text-text-medium py-2">No reviews yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {fbs.map((f) => (
                            <div key={f.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-text-dark text-xs">{f.reviewerName || "Anonymous"}</span>
                                <span className="text-orange-400 text-[10px] tracking-widest">{stars(f.rating)}</span>
                              </div>
                              <p className="text-text-medium text-xs leading-relaxed mb-1">{f.comment}</p>
                              <span className="text-gray-400 text-[9px] block">{f.createdAt?.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-dark flex items-center gap-2">
                  <FiShoppingCart className="text-primary" /> Shopping Cart
                </h3>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiXCircle className="text-2xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="text-6xl text-gray-200 mb-4"><FiShoppingCart /></div>
                    <p className="text-text-medium font-bold text-lg mb-1">Your cart is empty</p>
                    <p className="text-gray-400 text-sm">Add some delicious fresh crops from the market.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 bg-gray-50 border border-gray-150 rounded-xl relative group">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove Crop"
                      >
                        <FiTrash2 />
                      </button>

                      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-150">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <FiBox size={24} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-dark text-sm truncate pr-6">{item.product.productName}</h4>
                        <p className="text-xs text-text-medium mb-2">Farmer: {item.product.farmerName || "Farmer"}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                            <button 
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1, item.product.quantity)}
                              className="px-2.5 py-1 text-text-medium hover:bg-gray-100 font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 text-sm text-text-dark font-extrabold">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1, item.product.quantity)}
                              className="px-2.5 py-1 text-text-medium hover:bg-gray-100 font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-green-600 text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                  <div className="flex justify-between text-base font-bold text-text-dark">
                    <span>Subtotal</span>
                    <span className="text-green-600 text-lg">₹{totalCartPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Order requests will be sent instantly to individual farmers for confirmation.</p>
                  
                  <button 
                    onClick={handleCartCheckout}
                    disabled={checkingOut}
                    className="w-full py-3 bg-primary text-white hover:bg-green-600 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkingOut ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><FiCheckCircle /> Checkout & Place Orders</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default BrowseProducts;