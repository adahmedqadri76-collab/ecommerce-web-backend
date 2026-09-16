// Ye script sirf EK BAAR chalani hai taake MongoDB mein starting products aa jayein.
// Chalane ka tareeqa (terminal mein backend folder ke andar):
//   node seed.js
//
// Zaroori: pehle .env file mein MONGODB_URI set hona chahiye (ya terminal mein
// set karke chalayein), warna ye connect nahi hoga.

import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI nahi mila. .env file banayein aur usme MONGODB_URI=<aapka connection string> likhein.');
  process.exit(1);
}

const products = [
  // ---------- Casual ----------
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

  // ---------- Formal ----------
  { name: "Classic Formal Blazer", image: "/image3.png", images: ["/image3.png"], rating: "4.8/5", stars: "★★★★★", price: 220, costPrice: 130, description: "Classic formal blazer tailored for a sharp silhouette.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 18 },
  { name: "Formal Dress Pants", image: "/image4.png", images: ["/image4.png"], rating: "4.2/5", stars: "★★★★☆", price: 150, costPrice: 85, description: "Formal dress pants with a comfortable slim fit.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 22 },
  { name: "Executive White Shirt", image: "/image5.png", images: ["/image5.png"], rating: "4.7/5", stars: "★★★★★", price: 95, costPrice: 50, description: "Crisp executive white shirt for the office.", colors: ["#FFFFFF", "#E8E8E8"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 0 },
  { name: "Slim Fit Business Suit", image: "/image6.png", images: ["/image6.png"], rating: "4.9/5", stars: "★★★★★", price: 320, originalPrice: 380, discount: "-15%", costPrice: 200, description: "Slim fit business suit for a polished, modern look.", colors: ["#1B1B1B", "#26433B"], sizes: ["Medium", "Large", "X-Large"], category: "formal", stock: 10 },
  { name: "Formal Silk Necktie", image: "/image7.png", images: ["/image7.png"], rating: "4.3/5", stars: "★★★★☆", price: 45, costPrice: 20, description: "Formal silk necktie, a finishing touch for any suit.", colors: ["#313B2F", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "formal", stock: 60 },
  { name: "Oxford Leather Shoes", image: "/image8.png", images: ["/image8.png"], rating: "4.8/5", stars: "★★★★★", price: 180, costPrice: 100, description: "Oxford leather shoes with a timeless design.", colors: ["#1B1B1B", "#3B2A1A"], sizes: ["Medium", "Large", "X-Large"], category: "formal", stock: 14 },
  { name: "Pinstripe Formal Vest", image: "/image1.png", images: ["/image1.png"], rating: "4.1/5", stars: "★★★★☆", price: 110, costPrice: 60, description: "Pinstripe formal vest for a layered, formal look.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "formal", stock: 20 },
  { name: "Button-Down Business Shirt", image: "/image2.png", images: ["/image2.png"], rating: "4.4/5", stars: "★★★★☆", price: 105, costPrice: 55, description: "Button-down business shirt, breathable and sharp.", colors: ["#FFFFFF", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "formal", stock: 26 },

  // ---------- Party ----------
  { name: "Party Wear Velvet Shirt", image: "/image6.png", images: ["/image6.png"], rating: "4.6/5", stars: "★★★★★", price: 195, costPrice: 110, description: "Party wear velvet shirt that stands out on a night out.", colors: ["#26433B", "#1B1B1B"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 12 },
  { name: "Sequined Party Dress", image: "/image7.png", images: ["/image7.png"], rating: "4.9/5", stars: "★★★★★", price: 280, costPrice: 160, description: "Sequined party dress designed to shine under the lights.", colors: ["#1B1B1B", "#313B2F"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 8 },
  { name: "Metallic Shimmer Blazer", image: "/image3.png", images: ["/image3.png"], rating: "4.7/5", stars: "★★★★★", price: 250, originalPrice: 300, discount: "-16%", costPrice: 150, description: "Metallic shimmer blazer for a bold statement look.", colors: ["#252B48", "#1B1B1B"], sizes: ["Medium", "Large", "X-Large"], category: "party", stock: 0 },
  { name: "Satin Night Out Shirt", image: "/image4.png", images: ["/image4.png"], rating: "4.3/5", stars: "★★★★☆", price: 140, costPrice: 75, description: "Satin night out shirt with a smooth, glossy finish.", colors: ["#313B2F", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "party", stock: 19 },
  { name: "Designer Club Wear Jacket", image: "/image5.png", images: ["/image5.png"], rating: "4.5/5", stars: "★★★★☆", price: 215, costPrice: 125, description: "Designer club wear jacket built for the dance floor.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "party", stock: 16 },
  { name: "Velvet Evening Trousers", image: "/image8.png", images: ["/image8.png"], rating: "4.2/5", stars: "★★★★☆", price: 175, costPrice: 95, description: "Velvet evening trousers with a soft, luxe drape.", colors: ["#1B1B1B", "#252B48"], sizes: ["Medium", "Large", "X-Large"], category: "party", stock: 11 },

  // ---------- Gym ----------
  { name: "Gym Activewear Shorts", image: "/image8.png", images: ["/image8.png"], rating: "4.3/5", stars: "★★★★☆", price: 75, costPrice: 35, description: "Gym activewear shorts built for high-intensity workouts.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 55 },
  { name: "Compression Training Top", image: "/image1.png", images: ["/image1.png"], rating: "4.4/5", stars: "★★★★☆", price: 65, costPrice: 30, description: "Compression training top that moves with you.", colors: ["#1B1B1B", "#252B48"], sizes: ["Small", "Medium", "Large"], category: "gym", stock: 42 },
  { name: "Breathable Running Hoodie", image: "/image2.png", images: ["/image2.png"], rating: "4.7/5", stars: "★★★★★", price: 110, originalPrice: 130, discount: "-15%", costPrice: 65, description: "Breathable running hoodie for cool-weather cardio.", colors: ["#26433B", "#1B1B1B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 24 },
  { name: "Flexible Jogger Pants", image: "/image3.png", images: ["/image3.png"], rating: "4.5/5", stars: "★★★★☆", price: 90, costPrice: 45, description: "Flexible jogger pants with a tapered, athletic fit.", colors: ["#1B1B1B", "#313B2F"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 0 },
  { name: "Performance Workout Tank", image: "/image4.png", images: ["/image4.png"], rating: "4.1/5", stars: "★★★★☆", price: 45, costPrice: 18, description: "Performance workout tank, lightweight and breathable.", colors: ["#252B48", "#1B1B1B"], sizes: ["Small", "Medium", "Large"], category: "gym", stock: 38 },
  { name: "Athletic Zip-Up Track Jacket", image: "/image5.png", images: ["/image5.png"], rating: "4.8/5", stars: "★★★★★", price: 135, costPrice: 75, description: "Athletic zip-up track jacket for warm-ups and cool-downs.", colors: ["#1B1B1B", "#26433B"], sizes: ["Small", "Medium", "Large", "X-Large"], category: "gym", stock: 29 },
];

async function seed() {
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  await Product.deleteMany({});
  console.log('🗑️  Purane products clear kar diye');

  await Product.insertMany(products);
  console.log(`🌱 ${products.length} products successfully add ho gaye!`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
