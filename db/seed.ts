import { Role, OrderStatus } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. SEED USERS
  console.log("Seeding users...");
  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          email: `user${i}@example.com`,
          name: `User ${i}`,
          password: hashedPassword,
          role: i === 0 ? Role.ADMIN : Role.USER,
          addresses: {
            create: {
              fullName: `User ${i} Address`,
              phone: "1234567890",
              addressLine1: `${i} Main St`,
              city: "Colombo",
              district: "Western",
              country: "Sri Lanka",
              isDefault: true,
            },
          },
        },
      }),
    ),
  );

  // 2. SEED CATEGORIES (Recursive)
  console.log("Seeding categories...");
  const rootCategory = await prisma.category.upsert({
    where: { slug: "mens-clothing" },
    update: {},
    create: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      imageUrl: "https://via.placeholder.com/300",
    },
  });

  const subCategories = await Promise.all(
    ["T-Shirts", "Jeans", "Jackets", "Shoes"].map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase().replace(" ", "-") },
        update: {},
        create: {
          name,
          slug: name.toLowerCase().replace(" ", "-"),
          parentId: rootCategory.id,
        },
      }),
    ),
  );

  // 3. SEED PRODUCTS & VARIANTS
  console.log("Seeding products...");
  const products = [];
  for (let i = 1; i <= 10; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Product ${i}`,
        description: `High-quality material clothing item ${i}`,
        price: 29.99 + i,
        categoryId: subCategories[i % subCategories.length].id,
        images: {
          create: [
            { url: "https://via.placeholder.com/600", isPrimary: true },
            { url: "https://via.placeholder.com/600" },
          ],
        },
        variants: {
          create: [
            { size: "M", color: "Blue", stock: 10 },
            { size: "L", color: "Black", stock: 5 },
          ],
        },
      },
      include: { variants: true },
    });
    products.push(product);
  }

  // 4. SEED CARTS & ORDERS
  console.log("Seeding transactional data...");
  for (let i = 0; i < 5; i++) {
    const user = users[i];
    const variant = products[i].variants[0];

    // Create Cart
    await prisma.cart.create({
      data: {
        userId: user.id,
        items: {
          create: { variantId: variant.id, quantity: 1 },
        },
      },
    });

    // Create Order
    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: products[i].price,
        status: OrderStatus.PAID,
        items: {
          create: {
            variantId: variant.id,
            quantity: 1,
            price: products[i].price,
          },
        },
        delivery: {
          create: {
            fullName: user.name || "Customer",
            phone: "123456789",
            addressLine1: "123 Order St",
            city: "Colombo",
            district: "Western",
            country: "Sri Lanka",
          },
        },
      },
    });
  }

  // 5. SEED CAROUSEL
  console.log("Seeding carousel...");
  await prisma.carousel.upsert({
    where: { position: 1 },
    update: {},
    create: {
      name: "Homepage Main",
      position: 1,
      items: {
        create: Array.from({ length: 3 }).map((_, i) => ({
          imageUrl: "https://via.placeholder.com/1200x400",
          heading: `Sale ${i + 1}`,
          subHeading: "Get 50% off today!",
          linkUrl: "/shop",
          buttonText: "Shop Now",
          position: i,
        })),
      },
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
