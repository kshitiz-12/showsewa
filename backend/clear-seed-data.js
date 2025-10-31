const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSeedData() {
  console.log('🧹 Starting to clear seed data...');
  
  try {
    // Clear in reverse order of dependencies
    console.log('Clearing showtimes...');
    await prisma.showtime.deleteMany({});
    
    console.log('Clearing seats...');
    await prisma.seat.deleteMany({});
    
    console.log('Clearing seat categories...');
    await prisma.seatCategory.deleteMany({});
    
    console.log('Clearing screens...');
    await prisma.screen.deleteMany({});
    
    console.log('Clearing movies...');
    await prisma.movie.deleteMany({});
    
    console.log('Clearing theaters...');
    await prisma.theater.deleteMany({});
    
    // Keep users, bookings, and reviews as they might be admin-created
    
    console.log('✅ Seed data cleared successfully!');
    console.log('📝 Note: Users, bookings, and reviews were preserved');
    
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSeedData();
