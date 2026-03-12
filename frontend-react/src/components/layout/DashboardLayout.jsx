import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;