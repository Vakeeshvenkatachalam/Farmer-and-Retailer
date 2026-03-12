import DashboardLayout from "../../components/layout/DashboardLayout";
import { products } from "../../data/mockData";

function BrowseProducts() {
  return (
    <DashboardLayout>
      <h2>Browse Products</h2>

      <div className="stat-grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p>Farmer: {p.farmer}</p>
            <p>₹{p.price}</p>
            <p>Stock: {p.quantity}</p>
            <button>Order</button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default BrowseProducts;