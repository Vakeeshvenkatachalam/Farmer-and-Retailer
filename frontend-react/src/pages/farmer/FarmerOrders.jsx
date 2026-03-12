import DashboardLayout from "../../components/layout/DashboardLayout";
import { orders } from "../../data/mockData";

function FarmerOrders() {
  return (
    <DashboardLayout>
      <h2>Farmer Orders</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Retailer</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.product}</td>
              <td>{o.retailer}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default FarmerOrders;