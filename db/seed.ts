// import { Role, OrderStatus } from "../lib/generated/prisma";
// import bcrypt from "bcryptjs";
// import { prisma } from "./prisma";


// async function main() {
//   const hashedPassword = await bcrypt.hash("123", 10);

//   // 1. SEED USERS
//   console.log("Seeding users...");
// const users = [];
//   for (let i = 1; i <= 10; i++) {
//     const user = await prisma.user.upsert({
//       where: { email: `user${i}@example.com` },
//       update: {},
//       create: {
//         email: `user${i}@example.com`,
//         name: `User ${i}`,
//         password: hashedPassword, // In real apps, use bcrypt
//         role: i === 1 ? Role.ADMIN : Role.USER,
//         addresses: {
//           create: {
//             fullName: `User ${i} FullName`,
//             phone: `+123456789${i}`,
//             addressLine1: `${i}0${i} Main St`,
//             city: 'Sample City',
//             district: 'Central',
//             country: 'Countryland',
//             isDefault: true,
//           },
//         },
//       },
//     });
//     users.push(user);
//   }

//   // 3. CATEGORIES (10 records)
//   const categories = [];
//   for (let i = 1; i <= 10; i++) {
//     const category = await prisma.category.create({
//       data: {
//         name: `Category ${i}`,
//         slug: `category-${i}`,
//         imageUrl: `https://picsum.photos/seed/cat${i}/200`,
//       },
//     });
//     categories.push(category);
//   }

//   // 4. PRODUCTS & VARIANTS (10 Products, each with 2 variants)
//   const products = [];
//   for (let i = 1; i <= 10; i++) {
//     const product = await prisma.product.create({
//       data: {
//         name: `Product ${i}`,
//         description: `This is the amazing description for product ${i}`,
//         price: 19.99 * i,
//         categoryId: categories[i - 1].id,
//         images: {
//           create: [
//             { url: `https://picsum.photos/seed/prod${i}a/400`, isPrimary: true },
//             { url: `https://picsum.photos/seed/prod${i}b/400` },
//           ],
//         },
//         variants: {
//           create: [
//             { size: 'M', color: 'Blue', stock: 50 },
//             { size: 'L', color: 'Red', stock: 30 },
//           ],
//         },
//       },
//       include: { variants: true },
//     });
//     products.push(product);
//   }

//   // 5. CAROUSELS (2 Carousels with 5 items each = 10 items)
//   for (let i = 1; i <= 2; i++) {
//     await prisma.carousel.create({
//       data: {
//         name: `Homepage Hero ${i}`,
//         position: i,
//         items: {
//           create: [1, 2, 3, 4, 5].map((pos) => ({
//             heading: `Slide ${pos} for Carousel ${i}`,
//             subHeading: 'Limited time offer!',
//             imageUrl: `https://picsum.photos/seed/slide${i}${pos}/1200/400`,
//             textPosition: "CENTER",
//             position: pos,
//           })),
//         },
//       },
//     });
//   }

//   // 6. ORDERS (10 records)
//   for (let i = 1; i <= 10; i++) {
//     const user = users[i - 1];
//     const product = products[i - 1];
    
//     await prisma.order.create({
//       data: {
//         userId: user.id,
//         status: OrderStatus.PAID,
//         totalAmount: product.price * 2,
//         items: {
//           create: {
//             variantId: product.variants[0].id,
//             quantity: 2,
//             price: product.price,
//           },
//         },
//         delivery: {
//           create: {
//             fullName: user.name || 'Guest',
//             phone: '555-0199',
//             addressLine1: '123 Order St',
//             city: 'Order City',
//             district: 'Shipping Dist',
//             country: 'Countryland',
//           },
//         },
//       },
//     });
//   }

//   // 7. CONVERSATIONS & MESSAGES (10 records)
//   for (let i = 1; i <= 10; i++) {
//     await prisma.conversation.create({
//       data: {
//         userId: users[i - 1].id,
//         messages: {
//           create: [
//             { content: 'Hello, I have a question about my order.', senderId: users[i - 1].id },
//             { content: 'Sure, how can we help?', senderId: users[0].id }, // First user is Admin
//           ],
//         },
//       },
//     });
//   }

//   for (let i = 1; i <= 10; i++) {
//     // We'll pick a category and a product to link
//     const category = categories[i - 1];
//     const product = products[i - 1];

//     await prisma.displayItem.create({
//       data: {
//         title: `Featured Section ${i}`,
//         slug: `featured-section-${i}`,
//         categoryId: category.id,
//         position: i, // Unique constraint on position
//         isActive: true,
//         // Link the product via the junction table
//         items: {
//           create: {
//             productId: product.id,
//             position: 1, // First product in this display section
//           }
//         }
//       },
//     });
//   }

//   console.log('✅ Display items seeded.');

//   console.log('✅ Seeding finished.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });