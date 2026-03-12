export const users = [
  {
    id: 1,
    name: "Ramesh Kumar",
    role: "FARMER",
    status: "APPROVED",
    earnings: 45000
  },
  {
    id: 2,
    name: "Anita Traders",
    role: "RETAILER",
    status: "PENDING",
    spending: 30000
  }
];

export const products = [
  {
    id: 1,
    name: "Organic Tomato",
    farmer: "Ramesh Kumar",
    price: 30,
    quantity: 200,
    organic: true
  },
  {
    id: 2,
    name: "Basmati Rice",
    farmer: "Suresh Patel",
    price: 60,
    quantity: 500,
    organic: false
  }
];

export const orders = [
  {
    id: 1,
    product: "Organic Tomato",
    retailer: "Anita Traders",
    quantity: 50,
    total: 1500,
    status: "PLACED"
  }
];