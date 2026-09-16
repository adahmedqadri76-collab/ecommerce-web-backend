import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.Mixed },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true, default: 1 },
    size: { type: String },
    color: { type: String },
    category: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, default: 0 },
    customerName: { type: String, default: "Guest" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    status: { type: String, default: "Pending" }, // Pending | Shipped | Delivered | Cancelled
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
