import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    rating: { type: String, default: "4.5/5" },
    stars: { type: String, default: "★★★★☆" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: String },
    costPrice: { type: Number, default: 0 }, // Profit calculate karne ke liye
    description: { type: String, default: "" },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    category: { type: String, default: "casual" }, // casual | formal | party | gym
    stock: { type: Number, default: 0 }, // 0 ya kam = Out of Stock
    isNewArrival: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    isRelated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
