/**
 * Seed full category tree:
 * Electronics, Fashion, Home & Kitchen, Sports & Outdoors, Beauty & Health
 * Run: npx tsx src/db/seed-categories.ts
 */
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

function sl(name: string) {
  return slugify(name, { lower: true, strict: true });
}

async function upsertCategory(data: {
  name: string; slug: string; icon?: string;
  parentId?: string; sortOrder: number;
}) {
  // Try slug-based upsert first
  try {
    return await prisma.category.upsert({
      where: { slug: data.slug },
      create: { ...data, isActive: true },
      update: { parentId: data.parentId, sortOrder: data.sortOrder, icon: data.icon },
    });
  } catch {
    // If slug upsert fails due to name unique constraint, find by slug
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) return existing;
    throw new Error(`Could not upsert category: ${data.name}`);
  }
}

const TREE = [
  {
    name: 'Electronics', icon: '💻',
    children: [
      { name: 'Phones & Tablets', children: [
        'Smartphones','Tablets','Feature Phones','Phone Cases','Chargers',
      ]},
      { name: 'Computers', children: [
        'Laptops','Desktops','Monitors','Keyboards','Printers',
      ]},
      { name: 'Audio & TV', children: [
        'Headphones','Speakers','Smart TVs','Home Theater','Streaming',
      ]},
      { name: 'Gaming & Smart', children: [
        'Gaming Consoles','Games','Smart Home','Cameras','Drones',
      ]},
    ],
  },
  {
    name: 'Fashion', icon: '👗',
    children: [
      { name: "Men's Fashion", children: [
        'T-Shirts','Trousers','Suits','Shoes','Watches','Bags',
      ]},
      { name: "Women's Fashion", children: [
        'Dresses','Tops','Heels','Handbags','Jewelry','Perfume',
      ]},
      { name: "Kids' Fashion", children: [
        "Boys' Clothing","Girls' Clothing",'School Uniforms','Baby Wear',
      ]},
      { name: 'Accessories', children: [
        'Sunglasses','Belts','Hats','Socks','Scarves',
      ]},
    ],
  },
  {
    name: 'Home & Kitchen', icon: '🏠',
    children: [
      { name: 'Furniture', children: [
        'Sofas','Beds','Tables','Chairs','Wardrobes','Shelves',
      ]},
      { name: 'Kitchen', children: [
        'Cookware','Appliances','Utensils','Storage','Coffee Makers',
      ]},
      { name: 'Decor & Bedding', children: [
        'Cushions','Curtains','Bed Sheets','Towels','Rugs',
      ]},
      { name: 'Garden & Tools', children: [
        'Outdoor Furniture','Garden Tools','Power Tools','Lighting',
      ]},
    ],
  },
  {
    name: 'Sports & Outdoors', icon: '⚽',
    children: [
      { name: 'Fitness', children: [
        'Gym Equipment','Yoga','Running','Cycling','Swimming',
      ]},
      { name: 'Team Sports', children: [
        'Football','Basketball','Volleyball','Cricket','Tennis',
      ]},
      { name: 'Outdoor', children: [
        'Camping','Hiking','Climbing','Fishing','Water Sports',
      ]},
      { name: 'Sports Gear', children: [
        'Shoes','Clothing','Bags','Nutrition','Accessories',
      ]},
    ],
  },
  {
    name: 'Beauty & Health', icon: '📦',
    children: [
      { name: 'Skin Care', children: [
        'Moisturizers','Serums','Sunscreen','Face Wash','Toners',
      ]},
      { name: 'Hair Care', children: [
        'Shampoo','Conditioner','Hair Oil','Hair Color','Styling',
      ]},
      { name: 'Makeup', children: [
        'Foundation','Lipstick','Mascara','Eye Shadow','Blush',
      ]},
      { name: 'Health & Wellness', children: [
        'Vitamins','Supplements','Medical Devices','First Aid','Personal Care',
      ]},
    ],
  },
];

async function main() {
  console.log('🌱 Seeding categories...');

  for (const [topIdx, top] of TREE.entries()) {
    // Upsert top-level category
    const topCat = await upsertCategory({
      name: top.name, slug: sl(top.name),
      icon: top.icon, sortOrder: topIdx,
    });
    console.log(`  ✅ ${top.name}`);

    for (const [midIdx, mid] of top.children.entries()) {
      const midName = typeof mid === 'string' ? mid : mid.name;
      const midCat = await upsertCategory({
        name: midName, slug: sl(midName),
        parentId: topCat.id, sortOrder: midIdx,
      });
      console.log(`     ↳ ${midName}`);

      if (typeof mid !== 'string' && mid.children) {
        for (const [leafIdx, leaf] of mid.children.entries()) {
          await upsertCategory({
            name: leaf, slug: sl(leaf),
            parentId: midCat.id, sortOrder: leafIdx,
          });
          console.log(`        ↳ ${leaf}`);
        }
      }
    }
  }

  console.log('\n✅ Category seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
