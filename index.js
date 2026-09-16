import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Mongoose documents ko frontend-friendly "id" field ke sath bhejne ke liye helper
function toClient(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id.toString() };
}

// =====================================================================
// PUBLIC ROUTES (website ke liye)
// =====================================================================

app.get('/api/brands', (req, res) => {
  res.json([
    { id: 1, name: "VERSACE", className: "brand-versace" },
    { id: 2, name: "ZARA", className: "brand-zara" },
    { id: 3, name: "GUCCI", className: "brand-gucci" },
    { id: 4, name: "PRADA", className: "brand-prada" },
    { id: 5, name: "Calvin Klein", className: "brand-ck" }
  ]);
});

app.get('/api/products/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true });
    res.json(products.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/top-selling', async (req, res) => {
  try {
    const products = await Product.find({ isTopSelling: true });
    res.json(products.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/categories/styles', (req, res) => {
  res.json([
    { id: 1, title: "Casual", image: "/image9.png", className: "style-card-sm" },
    { id: 2, title: "Formal", image: "/image10.png", className: "style-card-lg" },
    { id: 3, title: "Party", image: "/image11.png", className: "style-card-lg" },
    { id: 4, title: "Gym", image: "/image12.png", className: "style-card-sm" }
  ]);
});

app.get('/api/products/related', async (req, res) => {
  try {
    const products = await Product.find({ isRelated: true });
    res.json(products.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single product detail - MUST be defined before other more specific routes below it
// aren't affected since Express matches in order and this path pattern is distinct.
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product nahi mila" });
    }
    res.json(toClient(product));
  } catch (err) {
    res.status(404).json({ message: "Product nahi mila" });
  }
});

app.get('/api/products/category/:styleName', async (req, res) => {
  try {
    const style = req.params.styleName.toLowerCase();
    const products = await Product.find({ category: style });
    res.json(products.length > 0 ? products.map(toClient) : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/reviews', (req, res) => {
  res.json([
    { id: 1, name: "Samantha D.", rating: "★★★★★", text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.", date: "Posted on August 14, 2023" },
    { id: 2, name: "Alex M.", rating: "★★★★☆", text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.", date: "Posted on August 15, 2023" },
    { id: 3, name: "Ethan R.", rating: "★★★★☆", text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.", date: "Posted on August 16, 2023" },
    { id: 4, name: "Olivia P.", rating: "★★★★☆", text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.", date: "Posted on August 17, 2023" },
    { id: 5, name: "Liam K.", rating: "★★★★☆", text: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.", date: "Posted on August 18, 2023" },
    { id: 6, name: "Ava H.", rating: "★★★★★", text: "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.", date: "Posted on August 19, 2023" },
    { id: 7, name: "Sarah J.", rating: "★★★★★", text: "The fabric quality is exceptionally durable. Even after multiple washes, the color didn't fade at all. Truly worth every penny!", date: "Posted on August 20, 2023" },
    { id: 8, name: "Michael B.", rating: "★★★★☆", text: "Great packaging and fast shipping. The fit is slightly oversized just like I wanted. Highly recommended for streetwear fans.", date: "Posted on August 21, 2023" },
    { id: 9, name: "Jessica W.", rating: "★★★★★", text: "Super soft material against the skin. I wear it to casual outings and always get compliments on the clean graphic design.", date: "Posted on August 22, 2023" },
    { id: 10, name: "David L.", rating: "★★★★☆", text: "Good value for money. The stitching is neat with no loose threads anywhere. Will definitely buy another color soon.", date: "Posted on August 23, 2023" },
  ]);
});

// =====================================================================
// ORDER ROUTES (checkout se order create hota hai)
// =====================================================================

// Naya order place karna (checkout se call hota hai)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order mein items hone chahiye" });
    }

    let totalAmount = 0;
    let totalProfit = 0;

    // Har item ke liye stock kam karein aur profit calculate karein
    for (const item of items) {
      totalAmount += item.price * item.quantity;
      totalProfit += (item.price - (item.costPrice || 0)) * item.quantity;

      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    const order = await Order.create({
      items,
      totalAmount,
      totalProfit,
      customerName: customerName || "Guest",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      address: address || "",
    });

    res.status(201).json(toClient(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================================================
// ADMIN ROUTES (dashboard ke liye)
// =====================================================================

// Simple password check - Railway par ADMIN_PASSWORD environment variable set karein
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === correctPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Galat password" });
  }
});

// Admin ke liye saare products (stock/cost sab ke sath)
app.get('/api/admin/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Naya product add karna
app.post('/api/admin/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(toClient(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Product edit karna (price, stock, image, waghera)
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product nahi mila" });
    res.json(toClient(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Product delete karna
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product nahi mila" });
    res.json({ message: "Product delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Saare orders (dashboard ke liye)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Order ka status update karna (Pending -> Shipped -> Delivered -> Cancelled)
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status galat hai" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order nahi mila" });
    res.json(toClient(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Order delete karna
app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order nahi mila" });
    res.json({ message: "Order delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Best-selling products (order items se calculate hota hai)
app.get('/api/admin/best-sellers', async (req, res) => {
  try {
    const orders = await Order.find();
    const salesMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.name;
        if (!salesMap[key]) {
          salesMap[key] = {
            name: item.name,
            image: item.image,
            quantitySold: 0,
            revenue: 0,
          };
        }
        salesMap[key].quantitySold += item.quantity;
        salesMap[key].revenue += item.price * item.quantity;
      });
    });

    const bestSellers = Object.values(salesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    res.json(bestSellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customers ki list (orders se derive hoti hai - name/email se group karke)
app.get('/api/admin/customers', async (req, res) => {
  try {
    const orders = await Order.find();
    const customerMap = {};

    orders.forEach((order) => {
      const key = order.customerEmail || order.customerName || 'Guest';
      if (!customerMap[key]) {
        customerMap[key] = {
          name: order.customerName || 'Guest',
          email: order.customerEmail || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
        };
      }
      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += order.totalAmount;
      if (new Date(order.createdAt) > new Date(customerMap[key].lastOrderDate)) {
        customerMap[key].lastOrderDate = order.createdAt;
      }
    });

    const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Coupons ----------

// Saare coupons (admin ke liye)
app.get('/api/admin/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons.map(toClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Naya coupon banana
app.post('/api/admin/coupons', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(toClient(coupon));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Ye code pehle se maujood hai" });
    }
    res.status(500).json({ message: err.message });
  }
});

// Coupon delete/deactivate karna
app.delete('/api/admin/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public route - checkout par coupon validate karne ke liye (website use karti hai)
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), active: true });

    if (!coupon) {
      return res.status(404).json({ message: "Ye promo code valid nahi hai" });
    }

    res.json({ discountPercent: coupon.discountPercent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ek-baar-chalane wala seed route: browser mein URL kholne se hi chal jata hai.
// Agar database khali hai, to starting 32 products daal deta hai. Agar products
// pehle se maujood hain to kuch nahi karta (dobara chalane se duplicate nahi banenge).
app.get('/api/admin/seed', async (req, res) => {
  try {
    const { password } = req.query;
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== correctPassword) {
      return res.status(401).json({ message: "Galat password. URL mein ?password=... sahi likhein." });
    }

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: `Database mein pehle se ${existingCount} products maujood hain, kuch nahi kiya.` });
    }

    const products = [
      { name: "T-shirt with Tape Details", image: "/image1.png", images: ["/image1.png"], rating: "4.5/5", stars: "★★★★☆", price: 120, costPrice: 65, description: "This graphic t-shirt which is perfect for any occasion.", colors: ["#313B2F", "#26433B", "#252B48"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 45, isNewArrival: true, isTopSelling: true },
      { name: "Skinny Fit Jeans", image: "/image2.png", images: ["/image2.png"], rating: "3.5/5", stars: "★★★☆☆", price: 240, originalPrice: 260, discount: "-20%", costPrice: 140, description: "Skinny fit jeans crafted from high-quality denim.", colors: ["#252B48", "#313B2F"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 30, isNewArrival: true },
      { name: "Checkered Shirt", image: "/image3.png", images: ["/image3.png"], rating: "4.5/5", stars: "★★★★☆", price: 180, costPrice: 95, description: "Stylish checkered shirt for casual wear.", colors: ["#313B2F", "#26433B"], sizes: ["Medium", "Large", "X-Large"], category: "casual", stock: 0, isNewArrival: true, isTopSelling: true },
      { name: "Sleeve Striped T-shirt", image: "/image4.png", images: ["/image4.png"], rating: "4.5/5", stars: "★★★★☆", price: 130, originalPrice: 160, discount: "-30%", costPrice: 70, description: "Comfortable sleeve striped t-shirt.", colors: ["#252B48", "#313B2F", "#26433B"], sizes: ["Small", "Medium", "Large"], category: "casual", stock: 60, isNewArrival: true },
      { name: "Courage Graphic T-shirt", image: "/image6.png", images: ["/image6.png"], rating: "4.0/5", stars: "★★★★☆", price: 145, costPrice: 80, description: "Courage graphic t-shirt with premium cotton.", colors: ["#26433B", "#252B48"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 25, isNewArrival: true, isTopSelling: true },
      { name: "Loose Fit Bermuda Shorts", image: "/image7.png", images: ["/image7.png"], rating: "3.0/5", stars: "★★★☆☆", price: 80, costPrice: 40, description: "Loose fit Bermuda shorts for summer.", colors: ["#313B2F", "#252B48"], sizes: ["Medium", "Large", "X-Large"], category: "casual", stock: 15, isNewArrival: true, isTopSelling: true },
      { name: "Vertical Striped Shirt", image: "/image5.png", images: ["/image5.png"], rating: "5.0/5", stars: "★★★★★", price: 212, originalPrice: 232, discount: "-20%", costPrice: 130, description: "Vertical striped shirt with a sharp, tailored look.", colors: ["#313B2F", "#26433B", "#252B48"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 40, isTopSelling: true },
      { name: "Faded Skinny Jeans", image: "/image8.png", images: ["/image8.png"], rating: "4.5/5", stars: "★★★★☆", price: 210, costPrice: 120, description: "Faded skinny jeans with a modern worn-in look.", colors: ["#252B48", "#313B2F"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 20, isTopSelling: true },
      { name: "Polo with Contrast Trims", image: "/image13.png", images: ["/image13.png"], rating: "4.0/5", stars: "★★★★☆", price: 212, originalPrice: 242, discount: "-20%", costPrice: 125, description: "Polo with contrast trims.", colors: ["#313B2F", "#26433B"], sizes: ["Small", "Medium", "Large"], category: "casual", stock: 35, isRelated: true },
      { name: "Gradient Graphic T-shirt", image: "/image14.png", images: ["/image14.png"], rating: "3.5/5", stars: "★★★☆☆", price: 145, costPrice: 75, description: "Gradient graphic t-shirt.", colors: ["#252B48", "#313B2F"], sizes: ["Medium", "Large", "X-Large"], category: "casual", stock: 50, isRelated: true },
      { name: "Polo with Tipping Details", image: "/image15.png", images: ["/image15.png"], rating: "4.5/5", stars: "★★★★☆", price: 180, costPrice: 95, description: "Polo with tipping details.", colors: ["#313B2F", "#26433B"], sizes: ["Small", "Medium", "Large"], category: "casual", stock: 28, isRelated: true },
      { name: "Black Striped T-shirt", image: "/image16.png", images: ["/image16.png"], rating: "5.0/5", stars: "★★★★★", price: 120, originalPrice: 150, discount: "-30%", costPrice: 60, description: "Black striped t-shirt.", colors: ["#252B48", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "casual", stock: 33, isRelated: true },
      { name: "Classic Formal Blazer", image: "/image3.png", images: ["/image3.png"], rating: "4.8/5", stars: "★★★★★", price: 220, costPrice: 130, description: "Classic formal blazer tailored for a sharp silhouette.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 18 },
      { name: "Formal Dress Pants", image: "/image4.png", images: ["/image4.png"], rating: "4.2/5", stars: "★★★★☆", price: 150, costPrice: 85, description: "Formal dress pants with a comfortable slim fit.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 22 },
      { name: "Executive White Shirt", image: "/image5.png", images: ["/image5.png"], rating: "4.7/5", stars: "★★★★★", price: 95, costPrice: 50, description: "Crisp executive white shirt for the office.", colors: ["#FFFFFF", "#E8E8E8"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 0 },
      { name: "Slim Fit Business Suit", image: "/image6.png", images: ["/image6.png"], rating: "4.9/5", stars: "★★★★★", price: 320, originalPrice: 380, discount: "-15%", costPrice: 200, description: "Slim fit business suit for a polished, modern look.", colors: ["#1B1B1B", "#26433B"], sizes: ["Medium", "Large", "X-Large"], category: "formal", stock: 10 },
      { name: "Formal Silk Necktie", image: "/image7.png", images: ["/image7.png"], rating: "4.3/5", stars: "★★★★☆", price: 45, costPrice: 20, description: "Formal silk necktie, a finishing touch for any suit.", colors: ["#313B2F", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "formal", stock: 60 },
      { name: "Oxford Leather Shoes", image: "/image8.png", images: ["/image8.png"], rating: "4.8/5", stars: "★★★★★", price: 180, costPrice: 100, description: "Oxford leather shoes with a timeless design.", colors: ["#1B1B1B", "#3B2A1A"], sizes: ["Medium", "Large", "X-Large"], category: "formal", stock: 14 },
      { name: "Pinstripe Formal Vest", image: "/image1.png", images: ["/image1.png"], rating: "4.1/5", stars: "★★★★☆", price: 110, costPrice: 60, description: "Pinstripe formal vest for a layered, formal look.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "formal", stock: 20 },
      { name: "Button-Down Business Shirt", image: "/image2.png", images: ["/image2.png"], rating: "4.4/5", stars: "★★★★☆", price: 105, costPrice: 55, description: "Button-down business shirt, breathable and sharp.", colors: ["#FFFFFF", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 26 },
      { name: "Party Wear Velvet Shirt", image: "/image6.png", images: ["/image6.png"], rating: "4.6/5", stars: "★★★★★", price: 195, costPrice: 110, description: "Party wear velvet shirt that stands out on a night out.", colors: ["#26433B", "#1B1B1B"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 12 },
      { name: "Sequined Party Dress", image: "/image7.png", images: ["/image7.png"], rating: "4.9/5", stars: "★★★★★", price: 280, costPrice: 160, description: "Sequined party dress designed to shine under the lights.", colors: ["#1B1B1B", "#313B2F"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 8 },
      { name: "Metallic Shimmer Blazer", image: "/image3.png", images: ["/image3.png"], rating: "4.7/5", stars: "★★★★★", price: 250, originalPrice: 300, discount: "-16%", costPrice: 150, description: "Metallic shimmer blazer for a bold statement look.", colors: ["#252B48", "#1B1B1B"], sizes: ["Medium", "Large", "X-Large"], category: "party", stock: 0 },
      { name: "Satin Night Out Shirt", image: "/image4.png", images: ["/image4.png"], rating: "4.3/5", stars: "★★★★☆", price: 140, costPrice: 75, description: "Satin night out shirt with a smooth, glossy finish.", colors: ["#313B2F", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 19 },
      { name: "Designer Club Wear Jacket", image: "/image5.png", images: ["/image5.png"], rating: "4.5/5", stars: "★★★★☆", price: 215, costPrice: 125, description: "Designer club wear jacket built for the dance floor.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "party", stock: 16 },
      { name: "Velvet Evening Trousers", image: "/image8.png", images: ["/image8.png"], rating: "4.2/5", stars: "★★★★☆", price: 175, costPrice: 95, description: "Velvet evening trousers with a soft, luxe drape.", colors: ["#1B1B1B", "#252B48"], sizes: ["Medium", "Large", "X-Large"], category: "party", stock: 11 },
      { name: "Gym Activewear Shorts", image: "/image8.png", images: ["/image8.png"], rating: "4.3/5", stars: "★★★★☆", price: 75, costPrice: 35, description: "Gym activewear shorts built for high-intensity workouts.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 55 },
      { name: "Compression Training Top", image: "/image1.png", images: ["/image1.png"], rating: "4.4/5", stars: "★★★★☆", price: 65, costPrice: 30, description: "Compression training top that moves with you.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "gym", stock: 42 },
      { name: "Breathable Running Hoodie", image: "/image2.png", images: ["/image2.png"], rating: "4.7/5", stars: "★★★★★", price: 110, originalPrice: 130, discount: "-15%", costPrice: 65, description: "Breathable running hoodie for cool-weather cardio.", colors: ["#26433B", "#1B1B1B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 24 },
      { name: "Flexible Jogger Pants", image: "/image3.png", images: ["/image3.png"], rating: "4.5/5", stars: "★★★★☆", price: 90, costPrice: 45, description: "Flexible jogger pants with a tapered, athletic fit.", colors: ["#1B1B1B", "#313B2F"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 0 },
      { name: "Performance Workout Tank", image: "/image4.png", images: ["/image4.png"], rating: "4.1/5", stars: "★★★★☆", price: 45, costPrice: 18, description: "Performance workout tank, lightweight and breathable.", colors: ["#252B48", "#1B1B1B"], sizes: ["Small", "Medium", "Large"], category: "gym", stock: 38 },
      { name: "Athletic Zip-Up Track Jacket", image: "/image5.png", images: ["/image5.png"], rating: "4.8/5", stars: "★★★★★", price: 135, costPrice: 75, description: "Athletic zip-up track jacket for warm-ups and cool-downs.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 29 },
    ];

    await Product.insertMany(products);
    res.json({ message: `${products.length} products successfully add ho gaye!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats: total income, total orders, total profit, monthly chart data
app.get('/api/admin/stats', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : null;

    const allOrders = await Order.find();
    const products = await Product.find();

    // Agar date range di gayi hai (jaise ?days=30), to sirf usi range ke orders lein
    let orders = allOrders;
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      orders = allOrders.filter((o) => new Date(o.createdAt) >= cutoff);
    }

    const totalIncome = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const outOfStockCount = products.filter((p) => p.stock <= 0).length;
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

    // Pichle 6 mahino ka income/profit chart data (hamesha poore 6 mahine, date-range se independent)
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthlyMap[key] = { month: key, income: 0, profit: 0 };
    }
    allOrders.forEach((o) => {
      const key = new Date(o.createdAt).toLocaleString('en-US', { month: 'short' });
      if (monthlyMap[key]) {
        monthlyMap[key].income += o.totalAmount;
        monthlyMap[key].profit += o.totalProfit;
      }
    });

    // Category-wise sales breakdown (selected date range ke hisaab se)
    const categoryMap = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.category || 'other';
        if (!categoryMap[cat]) categoryMap[cat] = { category: cat, revenue: 0, unitsSold: 0 };
        categoryMap[cat].revenue += item.price * item.quantity;
        categoryMap[cat].unitsSold += item.quantity;
      });
    });

    res.json({
      totalIncome,
      totalProfit,
      totalOrders,
      totalProducts,
      outOfStockCount,
      lowStockCount,
      monthlyChart: Object.values(monthlyMap),
      categoryBreakdown: Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue),
      recentOrders: orders.slice(0, 5).map(toClient),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk product upload (CSV se parse karke frontend ye array bhejta hai)
app.post('/api/admin/products/bulk', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products ki list khali hai" });
    }

    const inserted = await Product.insertMany(products);
    res.status(201).json({ message: `${inserted.length} products successfully add ho gaye!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});