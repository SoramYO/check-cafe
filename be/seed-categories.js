const mongoose = require('mongoose');
const MenuItemCategory = require('./src/models/menuItemCategory.model');

mongoose.connect('mongodb://localhost:27017/checkafe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categories = [
  { name: 'Cà phê', description: 'Các loại cà phê truyền thống và hiện đại' },
  { name: 'Trà', description: 'Trà các loại, trà sữa, trà trái cây' },
  { name: 'Bánh ngọt', description: 'Bánh ngọt, bánh kem, dessert' },
  { name: 'Đồ uống lạnh', description: 'Nước ép, sinh tố, đá xay' },
  { name: 'Món ăn nhẹ', description: 'Sandwich, salad, snack' }
];

async function seedCategories() {
  try {
    
    // Thêm dữ liệu mới
    const result = await MenuItemCategory.insertMany(categories);
    console.log('Seeded categories:', result.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories(); 