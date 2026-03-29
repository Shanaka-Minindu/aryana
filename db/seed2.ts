
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role, TextPosition } from "@/lib/generated/prisma";



async function main() {
  console.log("🗑️ Cleaning database...");
  // Delete in order of dependency
  await prisma.displayItemProduct.deleteMany();
  await prisma.displayItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.carouselItem.deleteMany();
  await prisma.carousel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. SEED USERS (10 records)
  console.log("👤 Seeding users...");
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        password: hashedPassword,
        role: i === 1 ? Role.ADMIN : Role.USER,
        addresses: {
          create: {
            fullName: `User ${i} FullName`,
            phone: `077123456${i}`,
            addressLine1: `${i} Main Street`,
            city: "Colombo",
            district: "Western",
            country: "Sri Lanka",
            isDefault: true,
          },
        },
      },
    });
    users.push(user);
  }

  // 2. SEED CATEGORIES (Nested 2-levels, 4 parents)
  console.log("📂 Seeding nested categories...");
  const categories = [];
  const parentNames = ["Electronics", "Fashion", "Home & Living", "Beauty"];

  for (let i = 0; i < parentNames.length; i++) {
    const parent = await prisma.category.create({
      data: {
        name: parentNames[i],
        slug: parentNames[i].toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
        children: {
          create: [
            {
              name: `Sub ${parentNames[i]} 1`,
              slug: `sub-${i}-1`,
              children: {
                create: {
                  name: `Deep ${parentNames[i]} Item`,
                  slug: `deep-${i}-item`,
                },
              },
            },
            {
              name: `Sub ${parentNames[i]} 2`,
              slug: `sub-${i}-2`,
            },
          ],
        },
      },
    });
    categories.push(parent);
  }
  // Total categories created by this loop = 4 (parents) + 8 (subs) + 4 (deep) = 16.

  // 3. SEED PRODUCTS (12 records)
  console.log("📦 Seeding products...");
  const allCategories = await prisma.category.findMany();
  const products = [];

  for (let i = 1; i <= 12; i++) {
    const isSale = i % 3 === 0;
    const price = 100 * i;
    const product = await prisma.product.create({
      data: {
        name: `Premium Product ${i}`,
        slug: `product-slug-${i}`,
        description: "High quality item with amazing features.",
        price: price,
        isSale: isSale,
        salePrice: isSale ? price * 0.8 : null,
        categoryId: allCategories[i % allCategories.length].id,
        images: {
          create: [
            { url: `https://picsum.photos/seed/p${i}/600/600`, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { color: "Black", size: "M", stock: 10 + i },
            { color: "White", size: "L", stock: 5 + i },
          ],
        },
      },
      include: { variants: true },
    });
    products.push(product);
  }

  // 4. SEED CAROUSEL (10 items total across 2 carousels)
  console.log("🎡 Seeding carousels...");
  for (let i = 1; i <= 2; i++) {
    await prisma.carousel.create({
      data: {
        name: `Home Slider ${i}`,
        position: i,
        items: {
          create: [1, 2, 3, 4, 5].map((pos) => ({
            heading: `Big Sale ${i}-${pos}`,
            subHeading: "Up to 50% off on all items",
            imageUrl: `https://picsum.photos/seed/slide${i}${pos}/1200/500`,
            textPosition: TextPosition.CENTER,
            position: pos,
            buttonText: "Shop Now",
            linkUrl: "/shop",
          })),
        },
      },
    });
  }

  // 5. SEED DISPLAY ITEMS (10 sections)
  console.log("📺 Seeding display items...");
  for (let i = 1; i <= 10; i++) {
    await prisma.displayItem.create({
      data: {
        title: `Collection ${i}`,
        slug: `collection-${i}`,
        categoryId: allCategories[0].id,
        position: i,
        items: {
          create: {
            productId: products[i % products.length].id,
            position: 1,
          },
        },
      },
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // to run : npx tsx --env-file=.env db/seed.ts