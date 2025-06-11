const mongoose = require("mongoose");
const ShopCategory = require("./src/models/shopCategory.model");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://adminCheckafe:adminCheckafe@cluster0.jhoxh6t.mongodb.net/checkafe", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedShopCategories = async () => {
  try {
    // Clear existing categories
    await ShopCategory.deleteMany({});
    console.log("Cleared existing shop categories");

    // Shop categories to seed
    const categories = [
      {
        name: "Cafe & Coffee Shop",
        description: "Coffee shops, cafeterias, and espresso bars",
        icon: "coffee",
        is_active: true,
      },
      {
        name: "Restaurant",
        description: "Full-service restaurants and dining establishments",
        icon: "restaurant",
        is_active: true,
      },
      {
        name: "Fast Food",
        description: "Quick service restaurants and fast food chains",
        icon: "fast_food",
        is_active: true,
      },
      {
        name: "Bar & Pub",
        description: "Bars, pubs, and alcohol-serving establishments",
        icon: "local_bar",
        is_active: true,
      },
      {
        name: "Bakery",
        description: "Bakeries and pastry shops",
        icon: "bakery_dining",
        is_active: true,
      },
      {
        name: "Tea House",
        description: "Tea houses and bubble tea shops",
        icon: "emoji_food_beverage",
        is_active: true,
      },
      {
        name: "Ice Cream & Dessert",
        description: "Ice cream parlors and dessert shops",
        icon: "icecream",
        is_active: true,
      },
      {
        name: "Street Food",
        description: "Street food vendors and food stalls",
        icon: "food_bank",
        is_active: true,
      },
    ];

    // Insert categories
    const createdCategories = await ShopCategory.insertMany(categories);
    console.log(`Successfully seeded ${createdCategories.length} shop categories:`);
    
    createdCategories.forEach((category) => {
      console.log(`- ${category.name}`);
    });

  } catch (error) {
    console.error("Error seeding shop categories:", error.message);
  }
};

const main = async () => {
  await connectDB();
  await seedShopCategories();
  await mongoose.connection.close();
  console.log("Database connection closed");
  process.exit(0);
};

main(); 