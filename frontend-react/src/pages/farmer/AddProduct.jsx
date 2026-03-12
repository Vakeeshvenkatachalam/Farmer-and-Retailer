import DashboardLayout from "../../components/layout/DashboardLayout";

function AddProduct() {
  return (
    <DashboardLayout>
      <h2>Add Product</h2>

      <div className="card">
        <input placeholder="Product Name" />
        <input placeholder="Category" />
        <input placeholder="Quantity" />
        <input placeholder="Price per unit ₹" />
        <input placeholder="Harvest Date" />
        <select>
          <option>Organic</option>
          <option>Non Organic</option>
        </select>
        <button>Add Product</button>
      </div>
    </DashboardLayout>
  );
}

export default AddProduct;