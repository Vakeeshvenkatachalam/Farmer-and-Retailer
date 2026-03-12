import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="overlay">
          <h1>FarmConnect</h1>
          <p>
            Connecting Farmers and Retailers Directly with Transparency,
            Fair Pricing, and Smart Technology.
          </p>

          <div className="hero-buttons">
            <Link to="/login">
              <button className="primary-btn">User Login</button>
            </Link>

            <Link to="/register">
              <button className="secondary-btn">Register</button>
            </Link>

            <Link to="/admin-login">
              <button className="admin-btn">Admin Login</button>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="why">
        <h2>Why Choose FarmConnect?</h2>

        <div className="why-grid">
          <div className="why-card">
            <h3>Fair Pricing</h3>
            <p>Farmers sell directly without middlemen.</p>
          </div>

          <div className="why-card">
            <h3>Trusted Network</h3>
            <p>Verified retailers and farmers.</p>
          </div>

          <div className="why-card">
            <h3>Fast Transactions</h3>
            <p>Quick listing and easy order management.</p>
          </div>

          <div className="why-card">
            <h3>Analytics Support</h3>
            <p>Smart insights for better decision making.</p>
          </div>
        </div>
      </section>


      {/* KEEP YOUR WHY + REVIEWS + FOOTER SAME */}

    </div>
  );
}

export default LandingPage;