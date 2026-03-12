import DashboardLayout from "../../components/layout/DashboardLayout";
import { orders } from "../../data/mockData";

function MyOrders() {
  return (
    <DashboardLayout>
      <h2>My Orders</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Total ₹</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.product}</td>
              <td>{o.total}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default MyOrders;