import prisma from '../lib/prisma'

const categories = [
  { name: 'Appetizers', slug: 'appetizers' },
  { name: 'Main Courses', slug: 'main-courses' },
  { name: 'Burgers', slug: 'burgers' },
  { name: 'Pizzas', slug: 'pizzas' },
  { name: 'Drinks', slug: 'drinks' },
  { name: 'Desserts', slug: 'desserts' },
]

const menuItems = [
  // Appetizers
  { name: 'Crispy Spring Rolls', description: 'Golden fried vegetable spring rolls with sweet chili sauce', price: 8.99, categorySlug: 'appetizers', image: 'https://picsum.photos/seed/springrolls/400/300' },
  { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 5.99, categorySlug: 'appetizers', image: 'https://picsum.photos/seed/garlicbread/400/300' },
  { name: 'Buffalo Wings', description: 'Crispy wings tossed in spicy buffalo sauce', price: 12.99, categorySlug: 'appetizers', image: 'https://picsum.photos/seed/wings/400/300' },

  // Main Courses
  { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon herb butter and vegetables', price: 24.99, categorySlug: 'main-courses', image: 'https://picsum.photos/seed/salmon/400/300' },
  { name: 'Chicken Parmesan', description: 'Breaded chicken breast with marinara and melted mozzarella', price: 18.99, categorySlug: 'main-courses', image: 'https://picsum.photos/seed/chickenparm/400/300' },
  { name: 'Beef Stir Fry', description: 'Tender beef strips with fresh vegetables in savory sauce', price: 19.99, categorySlug: 'main-courses', image: 'https://picsum.photos/seed/stirfry/400/300' },

  // Burgers
  { name: 'Classic Cheeseburger', description: 'Juicy beef patty with cheddar, lettuce, tomato, and special sauce', price: 14.99, categorySlug: 'burgers', image: 'https://picsum.photos/seed/cheeseburger/400/300' },
  { name: 'Bacon BBQ Burger', description: 'Smoky BBQ sauce, crispy bacon, and caramelized onions', price: 16.99, categorySlug: 'burgers', image: 'https://picsum.photos/seed/bbqburger/400/300' },
  { name: 'Mushroom Swiss Burger', description: 'Sauteed mushrooms and melted Swiss cheese', price: 15.99, categorySlug: 'burgers', image: 'https://picsum.photos/seed/mushroomburger/400/300' },

  // Pizzas
  { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomatoes, and basil on classic crust', price: 16.99, categorySlug: 'pizzas', image: 'https://picsum.photos/seed/margherita/400/300' },
  { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and melted cheese', price: 18.99, categorySlug: 'pizzas', image: 'https://picsum.photos/seed/pepperoni/400/300' },
  { name: 'Veggie Supreme', description: 'Bell peppers, onions, olives, mushrooms, and tomatoes', price: 17.99, categorySlug: 'pizzas', image: 'https://picsum.photos/seed/veggiepizza/400/300' },

  // Drinks
  { name: 'Fresh Lemonade', description: 'House-made lemonade with fresh lemons', price: 4.99, categorySlug: 'drinks', image: 'https://picsum.photos/seed/lemonade/400/300' },
  { name: 'Iced Coffee', description: 'Cold brew coffee with your choice of milk', price: 5.99, categorySlug: 'drinks', image: 'https://picsum.photos/seed/icedcoffee/400/300' },
  { name: 'Mango Smoothie', description: 'Tropical mango blended with yogurt and honey', price: 6.99, categorySlug: 'drinks', image: 'https://picsum.photos/seed/smoothie/400/300' },

  // Desserts
  { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 8.99, categorySlug: 'desserts', image: 'https://picsum.photos/seed/lavacake/400/300' },
  { name: 'New York Cheesecake', description: 'Classic creamy cheesecake with berry compote', price: 7.99, categorySlug: 'desserts', image: 'https://picsum.photos/seed/cheesecake/400/300' },
  { name: 'Tiramisu', description: 'Italian classic with espresso-soaked ladyfingers', price: 9.99, categorySlug: 'desserts', image: 'https://picsum.photos/seed/tiramisu/400/300' },
]

async function main() {
  console.log('Seeding database...')

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
  console.log('Categories created')

  // Create menu items
  for (const item of menuItems) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    })

    if (category) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          categoryId: category.id,
        },
      })
    }
  }
  console.log('Menu items created')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })