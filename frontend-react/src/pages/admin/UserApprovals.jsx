import DashboardLayout from "../../components/layout/DashboardLayout";
import { users } from "../../data/mockData";

function UserApprovals() {
  return (
    <DashboardLayout>
      <h2>User Approvals</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default UserApprovals;