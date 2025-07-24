import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Action',
        slug: 'action',
        description: 'Fast-paced games with combat and adventure',
        icon: '⚔️',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Puzzle',
        slug: 'puzzle',
        description: 'Brain-teasing games that challenge your logic',
        icon: '🧩',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Racing',
        slug: 'racing',
        description: 'High-speed racing and driving games',
        icon: '🏎️',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Strategy',
        slug: 'strategy',
        description: 'Games that require tactical thinking and planning',
        icon: '🎯',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports',
        slug: 'sports',
        description: 'Athletic and sports-based games',
        icon: '⚽',
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create sample games
  const games = await Promise.all([
    // Action Games
    prisma.game.create({
      data: {
        title: 'Space Warrior',
        slug: 'space-warrior',
        description: 'An epic space adventure with alien battles',
        longDescription: 'Embark on an intergalactic journey as a space warrior fighting against alien invasions. Use powerful weapons, upgrade your spaceship, and explore mysterious planets in this action-packed adventure.',
        thumbnail: '/placeholder.svg',
        screenshots: JSON.stringify(['/placeholder.svg', '/placeholder.svg']),
        categoryId: categories[0].id,
        tags: JSON.stringify(['space', 'action', 'adventure', 'shooter']),
        playCount: 1250,
        rating: 4.5,
        reviewCount: 89,
        developer: 'GameForge Studios',
        fileSize: '45MB',
        isFeature: true,
        status: 'FEATURED',
        views: 2500,
      },
    }),
    prisma.game.create({
      data: {
        title: 'Ninja Runner',
        slug: 'ninja-runner',
        description: 'Fast-paced ninja platformer with stealth action',
        longDescription: 'Master the art of the ninja in this fast-paced platformer. Run, jump, and use stealth to overcome obstacles and defeat enemies.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[0].id,
        tags: JSON.stringify(['ninja', 'platformer', 'action']),
        playCount: 890,
        rating: 4.2,
        reviewCount: 56,
        developer: 'Shadow Games',
        fileSize: '32MB',
        status: 'ACTIVE',
        views: 1800,
      },
    }),
    
    // Puzzle Games
    prisma.game.create({
      data: {
        title: 'Block Master',
        slug: 'block-master',
        description: 'Classic block-falling puzzle game with modern twists',
        longDescription: 'The classic puzzle game you love with new features, power-ups, and challenging levels. Perfect your skills and compete for high scores.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[1].id,
        tags: JSON.stringify(['puzzle', 'blocks', 'classic', 'arcade']),
        playCount: 2100,
        rating: 4.7,
        reviewCount: 134,
        developer: 'Puzzle Pro',
        fileSize: '18MB',
        isFeature: true,
        status: 'FEATURED',
        views: 3200,
      },
    }),
    prisma.game.create({
      data: {
        title: 'Word Quest',
        slug: 'word-quest',
        description: 'Adventure word puzzle game with RPG elements',
        longDescription: 'Combine word puzzles with RPG adventure. Spell words to cast spells, defeat monsters, and save the kingdom in this unique puzzle-adventure hybrid.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[1].id,
        tags: JSON.stringify(['word', 'puzzle', 'rpg', 'adventure']),
        playCount: 670,
        rating: 4.3,
        reviewCount: 42,
        developer: 'Word Wizards',
        fileSize: '28MB',
        status: 'ACTIVE',
        views: 1100,
      },
    }),

    // Racing Games
    prisma.game.create({
      data: {
        title: 'Speed Racer 3D',
        slug: 'speed-racer-3d',
        description: '3D racing game with realistic physics and stunning graphics',
        longDescription: 'Experience high-speed racing with realistic 3D graphics and physics. Choose from multiple cars, tracks, and game modes in this thrilling racing experience.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[2].id,
        tags: JSON.stringify(['racing', '3d', 'cars', 'simulation']),
        playCount: 1450,
        rating: 4.4,
        reviewCount: 78,
        developer: 'Speed Studios',
        fileSize: '65MB',
        status: 'ACTIVE',
        views: 2100,
      },
    }),

    // Strategy Games
    prisma.game.create({
      data: {
        title: 'Castle Defense',
        slug: 'castle-defense',
        description: 'Tower defense strategy game with medieval theme',
        longDescription: 'Defend your castle against waves of enemies using strategic tower placement and upgrades. Plan your defense carefully in this challenging strategy game.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[3].id,
        tags: JSON.stringify(['strategy', 'tower-defense', 'medieval']),
        playCount: 980,
        rating: 4.1,
        reviewCount: 65,
        developer: 'Strategy Masters',
        fileSize: '41MB',
        status: 'ACTIVE',
        views: 1650,
      },
    }),

    // Sports Games
    prisma.game.create({
      data: {
        title: 'Soccer Champions',
        slug: 'soccer-champions',
        description: 'Realistic soccer game with team management features',
        longDescription: 'Lead your team to victory in this realistic soccer simulation. Manage your squad, develop tactics, and compete in tournaments.',
        thumbnail: '/placeholder.svg',
        categoryId: categories[4].id,
        tags: JSON.stringify(['soccer', 'sports', 'simulation', 'management']),
        playCount: 1120,
        rating: 4.0,
        reviewCount: 89,
        developer: 'Sports Interactive',
        fileSize: '52MB',
        status: 'ACTIVE',
        views: 1890,
      },
    }),
  ]);

  console.log(`✅ Created ${games.length} games`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@gameforge.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`✅ Created admin user: ${admin.username}`);

  // Create sample analytics data
  const today = new Date();
  const analytics = await prisma.analytics.create({
    data: {
      date: today,
      pageViews: 1250,
      uniqueUsers: 890,
      gameViews: 2100,
      gamePlays: 1650,
      topGames: JSON.stringify([
        { id: games[0].id, title: games[0].title, plays: games[0].playCount },
        { id: games[2].id, title: games[2].title, plays: games[2].playCount },
        { id: games[4].id, title: games[4].title, plays: games[4].playCount },
      ]),
      topSearches: JSON.stringify([
        { query: 'action games', count: 45 },
        { query: 'puzzle', count: 32 },
        { query: 'racing', count: 28 },
      ]),
    },
  });

  console.log(`✅ Created analytics data`);

  // Create sample advertisements
  const ads = await Promise.all([
    prisma.advertisement.create({
      data: {
        name: 'Header Banner Ad',
        position: 'HEADER',
        size: '728x90',
        code: '<div style="background: #f0f0f0; padding: 20px; text-align: center;">Sample Header Ad</div>',
        impressions: 1250,
        clicks: 45,
      },
    }),
    prisma.advertisement.create({
      data: {
        name: 'Sidebar Ad',
        position: 'SIDEBAR',
        size: '300x250',
        code: '<div style="background: #e0e0e0; padding: 20px; text-align: center;">Sample Sidebar Ad</div>',
        impressions: 890,
        clicks: 23,
      },
    }),
  ]);

  console.log(`✅ Created ${ads.length} advertisements`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Games: ${games.length}`);
  console.log(`- Admin users: 1`);
  console.log(`- Analytics records: 1`);
  console.log(`- Advertisements: ${ads.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });