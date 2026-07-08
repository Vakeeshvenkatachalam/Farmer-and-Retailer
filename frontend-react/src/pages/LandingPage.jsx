import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, FiUsers, 
  FiMail, FiPhone, FiMapPin, FiMessageSquare, FiSend 
} from "react-icons/fi";

function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setFormSubmitted(false);
    }, 3000);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="home" className="min-h-screen bg-base-cream font-sans text-text-dark">
      
      {/* STICKY NAVBAR */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100 py-3.5" 
          : "bg-transparent py-5"
      }`}>
        {/* Brand Logo */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
          <span className="text-3xl">🌾</span>
          <span className="text-2xl font-black text-primary tracking-tight">FarmConnect</span>
        </Link>

        {/* Center navigation links */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-text-medium">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors">Home</button>
          <button onClick={() => scrollToSection("about")} className="hover:text-primary transition-colors">About</button>
          <button onClick={() => scrollToSection("features")} className="hover:text-primary transition-colors">Features</button>
          <button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors">Contact</button>
        </div>

        {/* Right action/login controls */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/login" 
            state={{ role: 'farmer' }}
            className="px-4 py-2 text-xs font-extrabold text-primary hover:bg-green-50 rounded-xl transition-all border border-transparent"
          >
            Farmer Login
          </Link>
          <Link 
            to="/login" 
            state={{ role: 'retailer' }}
            className="px-4 py-2 text-xs font-extrabold text-primary hover:bg-green-50 rounded-xl transition-all border border-transparent"
          >
            Retailer Login
          </Link>
          <Link 
            to="/admin-login" 
            className="px-4 py-2 text-xs font-extrabold text-text-medium hover:text-text-dark rounded-xl transition-all"
          >
            Admin Portal
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 text-xs font-extrabold bg-primary text-white rounded-full hover:bg-green-600 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            Register
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 flex flex-col items-start text-left z-10 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-primary font-bold text-xs mb-6 border border-green-200 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Direct Agricultural Procurement
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-text-dark leading-tight mb-6">
              Connect <span className="text-primary">Farmers</span> Directly with <span className="text-accent-orange">Retailers</span>
            </h1>
            <p className="text-lg text-text-medium mb-10 max-w-lg leading-relaxed">
              FarmConnect eliminates middlemen, bringing you fresh produce directly from verified farmers with transparent pricing and smart technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/register" className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-extrabold text-lg hover:bg-green-600 shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1">
                Get Started <FiArrowRight />
              </Link>
              <button onClick={() => scrollToSection("features")} className="flex items-center justify-center gap-2 bg-white text-text-dark border-2 border-gray-200 px-8 py-4 rounded-full font-extrabold text-lg hover:border-primary hover:text-primary transition-all">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative z-10 w-full animate-in fade-in duration-700">
            <div className="relative w-full aspect-square max-w-md mx-auto lg:ml-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl mix-blend-multiply"></div>
              <div className="absolute -inset-4 bg-accent-orange/20 rounded-full blur-3xl mix-blend-multiply translate-x-10 translate-y-10"></div>
              
              <div className="relative w-full h-full rounded-[2.5rem] p-8 flex flex-col gap-6 items-center justify-center border border-white/60 shadow-2xl bg-white/70 backdrop-blur-xl">
                
                {/* Simulated UI Cards inside the hero graphic */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full flex items-center gap-4 transform translate-x-4">
                  <div className="w-12 h-12 bg-green-50 text-primary rounded-full flex items-center justify-center text-xl">👨‍🌾</div>
                  <div>
                    <p className="font-bold text-sm text-text-dark">Raju's Organic Farm</p>
                    <p className="text-xs text-text-medium">Listed 50kg Fresh Tomatoes</p>
                  </div>
                  <div className="ml-auto text-primary font-bold">₹1,200</div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full flex items-center gap-4 transform -translate-x-4">
                  <div className="w-12 h-12 bg-orange-50 text-accent-orange rounded-full flex items-center justify-center text-xl">🏪</div>
                  <div>
                    <p className="font-bold text-sm text-text-dark">City FreshMart</p>
                    <p className="text-xs text-text-medium">Order Placed Successfully</p>
                  </div>
                  <div className="ml-auto text-primary text-xl"><FiCheckCircle /></div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full flex items-center gap-4 transform translate-x-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">💸</div>
                  <div>
                    <p className="font-bold text-sm text-text-dark">Payment Secured</p>
                    <p className="text-xs text-text-medium">Zero Commission Added</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black text-text-dark mb-6">About FarmConnect</h2>
              <p className="text-text-medium leading-relaxed mb-6">
                FarmConnect is a state-of-the-art agricultural trading network built to solve efficiency challenges in retail crop acquisition. By linking local farmers directly with business retail managers, we establish a robust marketplace with guaranteed logistics tracking and prompt payments.
              </p>
              <p className="text-text-medium leading-relaxed">
                Our vision is to elevate farming economies, eliminate unnecessary distribution costs, and deliver fresh organic produce to consumers nationwide at fair, realistic prices.
              </p>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="p-6 bg-base-cream rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-primary">100%</p>
                <p className="text-xs font-bold text-text-medium uppercase mt-2">Verified Members</p>
              </div>
              <div className="p-6 bg-base-cream rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-primary">₹0</p>
                <p className="text-xs font-bold text-text-medium uppercase mt-2">Middlemen Cost</p>
              </div>
              <div className="p-6 bg-base-cream rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-primary">4.8★</p>
                <p className="text-xs font-bold text-text-medium uppercase mt-2">Average Crop Rating</p>
              </div>
              <div className="p-6 bg-base-cream rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-primary">Live</p>
                <p className="text-xs font-bold text-text-medium uppercase mt-2">Realtime Order Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-base-cream relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-text-dark mb-4">Why Choose FarmConnect?</h2>
            <p className="text-text-medium max-w-2xl mx-auto text-lg">Our platform is built to empower agricultural communities through transparency, speed, and fairness.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-green-50 rounded-2xl shadow-inner flex items-center justify-center text-primary text-2xl mb-6 border border-green-100">
                <FiShield />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Fair Pricing</h3>
              <p className="text-text-medium text-sm leading-relaxed">Farmers sell directly to retailers without middlemen, keeping more profit and offering better prices.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-green-50 rounded-2xl shadow-inner flex items-center justify-center text-primary text-2xl mb-6 border border-green-100">
                <FiUsers />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Trusted Network</h3>
              <p className="text-text-medium text-sm leading-relaxed">Every farmer and retailer is verified by our admins, ensuring a safe and secure marketplace.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-green-50 rounded-2xl shadow-inner flex items-center justify-center text-primary text-2xl mb-6 border border-green-100">
                <FiCheckCircle />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Fast Transactions</h3>
              <p className="text-text-medium text-sm leading-relaxed">Quick product listings, easy ordering workflows, and real-time status updates.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-green-50 rounded-2xl shadow-inner flex items-center justify-center text-primary text-2xl mb-6 border border-green-100">
                <FiTrendingUp />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Smart Analytics</h3>
              <p className="text-text-medium text-sm leading-relaxed">Track your revenue, orders, and market trends right from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-24 h-24 bg-base-cream rounded-3xl shadow-inner border border-gray-150 flex items-center justify-center text-3xl font-black text-primary mb-6 transform -rotate-3">1</div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Register</h3>
              <p className="text-text-medium text-sm max-w-xs">Sign up as a Farmer or Retailer and get instantly verified to join the network.</p>
            </div>
            
            <div className="hidden md:block w-32 h-1 border-t-2 border-dashed border-gray-200 absolute left-[20%] top-12"></div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-24 h-24 bg-base-cream rounded-3xl shadow-inner border border-gray-150 flex items-center justify-center text-3xl font-black text-primary mb-6 rotate-3">2</div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Connect</h3>
              <p className="text-text-medium text-sm max-w-xs">List your harvest or browse the marketplace for fresh, organic produce.</p>
            </div>
            
            <div className="hidden md:block w-32 h-1 border-t-2 border-dashed border-gray-200 absolute right-[20%] top-12"></div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-24 h-24 bg-primary rounded-3xl shadow-lg shadow-primary/30 flex items-center justify-center text-3xl font-black text-white mb-6 -rotate-3">3</div>
              <h3 className="text-xl font-bold mb-3 text-text-dark">Trade</h3>
              <p className="text-text-medium text-sm max-w-xs">Place orders, manage shipping, and process payments securely in one place.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-base-cream relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col lg:flex-row">
            {/* Contact details */}
            <div className="lg:w-2/5 bg-gradient-to-tr from-primary to-emerald-600 p-12 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-4">Contact Information</h3>
                <p className="text-green-100 text-sm mb-10 leading-relaxed">Have questions about listings or setup? Drop us a message, and our customer team will respond shortly.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <FiMail className="text-xl shrink-0" />
                    <span className="text-sm font-semibold">support@farmconnect.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <FiPhone className="text-xl shrink-0" />
                    <span className="text-sm font-semibold">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <FiMapPin className="text-xl shrink-0" />
                    <span className="text-sm font-semibold">Sector 4, Krishi Bhawan, New Delhi</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/20 mt-10">
                <p className="text-xs text-green-150 font-bold uppercase tracking-wider">Office Hours</p>
                <p className="text-sm mt-1">Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleContactSubmit} className="lg:w-3/5 p-12 space-y-6">
              <h3 className="text-2xl font-bold text-text-dark flex items-center gap-2">
                <FiMessageSquare className="text-primary" /> Send Us A Message
              </h3>
              
              {formSubmitted && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-150 font-bold text-sm text-center">
                  Message Sent! We will get back to you shortly.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-medium uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Your Message</label>
                <textarea 
                  rows="4"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-medium text-sm bg-gray-50"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
              >
                <FiSend /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+)] opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Ready to transform your trade?</h2>
              <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of farmers and retailers already using FarmConnect to grow their business.</p>
              <Link to="/register" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-16 border-t border-gray-100 text-sm text-text-medium">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-black text-text-dark tracking-tight">FarmConnect</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              Empowering direct digital trade networks between agricultural producers and local business managers. Completely transparent, completely middleman-free.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-dark text-xs uppercase tracking-wider">Quick Navigation</h4>
            <div className="flex flex-col gap-2 text-xs">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left hover:text-primary">Home</button>
              <button onClick={() => scrollToSection("about")} className="text-left hover:text-primary">About Platform</button>
              <button onClick={() => scrollToSection("features")} className="text-left hover:text-primary">Our Features</button>
              <button onClick={() => scrollToSection("contact")} className="text-left hover:text-primary">Get in Touch</button>
            </div>
          </div>

          {/* Portal Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-dark text-xs uppercase tracking-wider">Access Portals</h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link to="/login" state={{ role: 'farmer' }} className="hover:text-primary">Farmer Portal</Link>
              <Link to="/login" state={{ role: 'retailer' }} className="hover:text-primary">Retailer Portal</Link>
              <Link to="/admin-login" className="hover:text-primary">Admin Control Center</Link>
              <Link to="/register" className="hover:text-primary">Register New Account</Link>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} FarmConnect Trading Platform. Built with clean light green startup aesthetics.</span>
          <div className="flex gap-6">
            <Link to="/" className="hover:underline">Privacy Policy</Link>
            <Link to="/" className="hover:underline">Terms of Service</Link>
            <Link to="/" className="hover:underline">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;