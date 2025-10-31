import { PrismaClient, Screen, Theater } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists to avoid conflicts
  let adminUser = await prisma.user.findFirst({
    where: {
      email: 'admin@showsewa.com'
    }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@showsewa.com',
        password: 'hashedpassword123',
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('✅ Admin user created');
  } else {
    console.log('✅ Admin user already exists');
  }

  // Check if we should run seed data (only if no theaters exist)
  const existingTheaterCount = await prisma.theater.count();
  if (existingTheaterCount > 0) {
    console.log('⚠️  Theaters already exist - skipping seed data to avoid conflicts with admin panel');
    console.log('🎉 Database seeding completed (skipped to preserve admin data)');
    return;
  }

  console.log('🌱 No existing theaters found - creating seed data...');

  // Create Multiple Theaters across Nepal
  const theaters = [];

  const qfxTheater = await prisma.theater.create({
    data: {
      name: 'QFX Cinemas - Civil Mall',
      nameNe: 'क्यूएफएक्स सिनेमा - सिविल मल',
      city: 'Kathmandu',
      area: 'Civil Mall',
      address: 'Civil Mall, Kathmandu',
      phone: '+977-1-4444444',
      amenities: ['AC', 'Dolby Sound', '3D', 'Food Court'],
      isActive: true,
    },
  });
  theaters.push(qfxTheater);

  const qfxLabim = await prisma.theater.create({
    data: {
      name: 'QFX Cinemas - Labim Mall',
      nameNe: 'क्यूएफएक्स सिनेमा - लाबिम मल',
      city: 'Kathmandu',
      area: 'Labim Mall',
      address: 'Labim Mall, Pulchowk, Kathmandu',
      phone: '+977-1-5555555',
      amenities: ['AC', 'Dolby Sound', 'IMAX', '4DX', 'Food Court'],
      isActive: true,
    },
  });
  theaters.push(qfxLabim);

  const bigMovies = await prisma.theater.create({
    data: {
      name: 'BigMovies - Jaya Nepal',
      nameNe: 'बिगमुभिज - जया नेपाल',
      city: 'Kathmandu',
      area: 'New Road',
      address: 'New Road, Kathmandu',
      phone: '+977-1-3333333',
      amenities: ['AC', 'Digital Projection', 'Snack Bar'],
      isActive: true,
    },
  });
  theaters.push(bigMovies);

  const qfxPokhara = await prisma.theater.create({
    data: {
      name: 'QFX Cinemas - Pokhara',
      nameNe: 'क्यूएफएक्स सिनेमा - पोखरा',
      city: 'Pokhara',
      area: 'Lakeside',
      address: 'Lakeside, Pokhara',
      phone: '+977-61-7777777',
      amenities: ['AC', 'Dolby Sound', '3D', 'Lake View'],
      isActive: true,
    },
  });
  theaters.push(qfxPokhara);

  const cinemax = await prisma.theater.create({
    data: {
      name: 'Cinemax - Patan',
      nameNe: 'सिनिम्याक्स - पाटन',
      city: 'Lalitpur',
      area: 'Patan',
      address: 'Patan Durbar Square Area, Lalitpur',
      phone: '+977-1-2222222',
      amenities: ['AC', 'Premium Seats', 'Cultural Experience'],
      isActive: true,
    },
  });
  theaters.push(cinemax);

  console.log(`✅ ${theaters.length} theaters created`);

  // Create Screens for all theaters
  const allScreens: Screen[] = [];
  
  // Helper function to create screens and seats for a theater
  async function createTheaterScreens(theater: Theater, theaterType: 'premium' | 'standard' | 'budget'): Promise<Screen[]> {
    const screens: Screen[] = [];
    const screenCount = theaterType === 'premium' ? 4 : theaterType === 'standard' ? 3 : 2;
    const capacity = theaterType === 'premium' ? 250 : theaterType === 'standard' ? 200 : 150;
    const rows = theaterType === 'premium' ? 12 : theaterType === 'standard' ? 10 : 8;
    const seatsPerRow = Math.ceil(capacity / rows);

    for (let i = 1; i <= screenCount; i++) {
      const screen = await prisma.screen.create({
        data: {
          theaterId: theater.id,
          screenNumber: i,
          name: `Screen ${i}${i === 1 && theaterType === 'premium' ? ' - IMAX' : i === 2 && theaterType === 'premium' ? ' - 4DX' : ''}`,
          capacity: capacity,
          screenType: i === 1 && theaterType === 'premium' ? 'IMAX' : i === 2 && theaterType === 'premium' ? '4DX' : 'Standard',
          layoutConfig: {
            rows: rows,
            seatsPerRow: seatsPerRow,
            totalSeats: capacity
          },
          isActive: true,
        },
      });
      screens.push(screen);
      allScreens.push(screen);
    }
    return screens;
  }

  // Create screens for each theater
  const qfxCivilScreens = await createTheaterScreens(qfxTheater, 'premium');
  const qfxLabimScreens = await createTheaterScreens(qfxLabim, 'premium');
  const bigMoviesScreens = await createTheaterScreens(bigMovies, 'standard');
  const qfxPokharaScreens = await createTheaterScreens(qfxPokhara, 'standard');
  const cinemaxScreens = await createTheaterScreens(cinemax, 'budget');

  console.log(`✅ ${allScreens.length} screens created across all theaters`);

  // Helper function to create seats for a screen
  async function createScreenSeats(screen: Screen): Promise<number> {
    const layoutConfig = screen.layoutConfig as any;
    const rows = layoutConfig.rows;
    const seatsPerRow = layoutConfig.seatsPerRow;
    
    // Generate row letters based on capacity
    const rowLetters = [];
    for (let i = 0; i < rows; i++) {
      rowLetters.push(String.fromCharCode(65 + i)); // A, B, C, etc.
    }

    // Create seat categories for this screen
    const premiumCategory = await prisma.seatCategory.create({
      data: {
        screenId: screen.id,
        categoryId: 'premium',
        name: 'Premium',
        nameNe: 'प्रिमियम',
        price: screen.screenType === 'IMAX' ? 1200 : 800,
        color: '#FFD700',
        features: ['Extra Comfort', screen.screenType === 'IMAX' ? 'IMAX Experience' : 'Premium View'],
        rowMapping: rowLetters.slice(0, Math.ceil(rows * 0.2)), // First 20% of rows
      },
    });

    const standardCategory = await prisma.seatCategory.create({
      data: {
        screenId: screen.id,
        categoryId: 'standard',
        name: 'Standard',
        nameNe: 'मानक',
        price: 600,
        color: '#4CAF50',
        features: ['Comfortable', 'Good View'],
        rowMapping: rowLetters.slice(
          Math.ceil(rows * 0.2), 
          Math.ceil(rows * 0.8)
        ), // Middle 60% of rows
      },
    });

    const economyCategory = await prisma.seatCategory.create({
      data: {
        screenId: screen.id,
        categoryId: 'economy',
        name: 'Economy',
        nameNe: 'अर्थव्यवस्था',
        price: 400,
        color: '#2196F3',
        features: ['Budget Friendly'],
        rowMapping: rowLetters.slice(Math.ceil(rows * 0.8)), // Last 20% of rows
      },
    });

    // Create seats
    const seats = [];
    for (let rowIndex = 0; rowIndex < rowLetters.length; rowIndex++) {
      const row = rowLetters[rowIndex];
      
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        let categoryId = standardCategory.id;
        let price = 600;
        
        // Determine category and price based on row position
        if (rowIndex < Math.ceil(rows * 0.2)) {
          categoryId = premiumCategory.id;
          price = screen.screenType === 'IMAX' ? 1200 : 800;
        } else if (rowIndex >= Math.ceil(rows * 0.8)) {
          categoryId = economyCategory.id;
          price = 400;
        }
        
        seats.push({
          screenId: screen.id,
          seatNumber: `${row}${seatNum}`,
          categoryId: categoryId,
          row: row,
          column: seatNum,
          price: price,
          isActive: true,
        });
      }
    }

    await prisma.seat.createMany({
      data: seats,
    });

    return seats.length;
  }

  // Create seats for all screens
  let totalSeats = 0;
  for (const screen of allScreens) {
    const seatCount = await createScreenSeats(screen);
    totalSeats += seatCount;
  }

  console.log(`✅ ${totalSeats} seats created across ${allScreens.length} screens`);

  // Check if movies already exist to avoid overriding admin data
  const existingMovieCount = await prisma.movie.count();
  if (existingMovieCount > 0) {
    console.log('⚠️  Movies already exist - skipping movie creation to avoid conflicts with admin panel');
    console.log('🎉 Database seeding completed successfully!');
    return;
  }

  // Create Multiple Movies
  const movies = [
    {
      title: 'Pathaan',
      titleNe: 'पठान',
      description: 'Action thriller starring Shah Rukh Khan in an unforgettable spy adventure.',
      descriptionNe: 'शाहरुख खानको अभिनयमा अविस्मरणीय जासूसी साहसिक',
      genre: ['Action', 'Thriller'],
      duration: 146,
      language: ['Hindi'],
      rating: 'U/A',
      releaseDate: new Date('2023-01-25'),
      isTrending: true,
      imdbRating: 7.2,
      director: 'Siddharth Anand',
      cast: ['Shah Rukh Khan', 'Deepika Padukone', 'John Abraham'],
      galleryImages: ['pathaan-1.jpg', 'pathaan-2.jpg', 'pathaan-3.jpg'],
    },
    {
      title: 'Avatar: The Way of Water',
      titleNe: 'अवतार: जलको बाटो',
      description: 'Jake Sully and Ney\'tiri have formed a family and are doing everything to stay together.',
      descriptionNe: 'जेक सुल्ली र नेयतिरीले परिवार बनाएका छन् र सँगै रहन सबै गर्ने कोसिस गरिरहेका छन्',
      genre: ['Sci-Fi', 'Adventure'],
      duration: 192,
      language: ['English'],
      rating: 'U/A',
      releaseDate: new Date('2022-12-16'),
      isTrending: true,
      imdbRating: 7.6,
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
      galleryImages: ['avatar2-1.jpg', 'avatar2-2.jpg'],
    },
    {
      title: 'Kantara',
      titleNe: 'कान्तारा',
      description: 'Set in fictional place called Kantara, the film follows a tense conflict between humans and nature.',
      descriptionNe: 'काल्पनिक स्थान कान्तारामा सेट गरिएको चलचित्र, मानिस र प्रकृतिको बीच तनावपूर्ण द्वन्द्वको अनुसरण गर्छ',
      genre: ['Action', 'Drama'],
      duration: 148,
      language: ['Kannada'],
      rating: 'U/A',
      releaseDate: new Date('2022-09-30'),
      isTrending: false,
      imdbRating: 8.2,
      director: 'Rishab Shetty',
      cast: ['Rishab Shetty', 'Sapthami Gowda', 'Achyuth Kumar'],
      galleryImages: ['kantara-1.jpg'],
    },
    {
      title: 'Black Panther: Wakanda Forever',
      titleNe: 'ब्ल्याक प्यान्थर: वेकाण्डा फोरभर',
      description: 'The nation of Wakanda is pitted against intervening world powers as they mourn the loss of their king T\'Challa.',
      descriptionNe: 'आफ्ना राजा टीचल्लाको नुकसानका लागि शोक व्यक्त गर्दा वेकाण्डा राष्ट्र हस्तक्षेप गर्ने विश्व शक्तिहरूसँग टक्कर खान्छ',
      genre: ['Action', 'Adventure'],
      duration: 161,
      language: ['English'],
      rating: 'U/A',
      releaseDate: new Date('2022-11-11'),
      isTrending: false,
      imdbRating: 6.7,
      director: 'Ryan Coogler',
      cast: ['Letitia Wright', 'Angela Bassett', 'Tenoch Huerta'],
      galleryImages: ['bp2-1.jpg', 'bp2-2.jpg'],
    },
    {
      title: 'Top Gun: Maverick',
      titleNe: 'टप गन: म्याभेरिक',
      description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.',
      descriptionNe: 'तीस वर्ष पछि पनि, म्याभेरिक एक शीर्ष नौसेना उड्डयनकर्ताको रूपमा सीमाहरू धक्का दिँदै छ',
      genre: ['Action', 'Drama'],
      duration: 131,
      language: ['English'],
      rating: 'U/A',
      releaseDate: new Date('2022-05-27'),
      isTrending: true,
      imdbRating: 8.3,
      director: 'Joseph Kosinski',
      cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
      galleryImages: ['topgun2-1.jpg'],
    },
  ];

  const createdMovies = [];
  for (const movieData of movies) {
    const movie = await prisma.movie.create({
      data: {
        ...movieData,
        posterUrl: `https://example.com/${movieData.title.toLowerCase().replace(/\s+/g, '-')}-poster.jpg`,
        trailerUrl: `https://youtube.com/watch?v=${movieData.title.toLowerCase().replace(/\s+/g, '-')}-trailer`,
        isActive: true,
        createdBy: adminUser.id,
      },
    });
    createdMovies.push(movie);
  }

  console.log(`✅ ${createdMovies.length} movies created`);

  // Create Multiple Showtimes
  const showtimes = [];
  const showDates = [
    new Date(),
    new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
  ];
  const showTimes = ['10:30', '14:00', '17:30', '20:45'];

  for (const movie of createdMovies) {
    for (const screen of allScreens) {
      // Create 2-3 showtimes per movie per screen for the next few days
      const showtimesForThisCombo = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < showtimesForThisCombo; i++) {
        const randomDate = showDates[Math.floor(Math.random() * showDates.length)];
        const randomTime = showTimes[Math.floor(Math.random() * showTimes.length)];
        
        // Get screen capacity from layoutConfig
        const capacity = (screen.layoutConfig as any).totalSeats;
        
        const showtime = await prisma.showtime.create({
          data: {
            movieId: movie.id,
            screenId: screen.id,
            showDate: randomDate,
            showTime: randomTime,
            price: screen.screenType === 'IMAX' ? 1000 : 600,
            language: movie.language[0],
            totalSeats: capacity,
            availableSeats: capacity - Math.floor(Math.random() * 20), // Some bookings
            isActive: true,
          },
        });
        showtimes.push(showtime);
      }
    }
  }

  console.log(`✅ ${showtimes.length} showtimes created`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Comprehensive Summary:
- 1 Admin user created
- ${theaters.length} Theaters created across Nepal:
  * QFX Cinemas - Civil Mall (Kathmandu)
  * QFX Cinemas - Labim Mall (Kathmandu)  
  * BigMovies - Jaya Nepal (Kathmandu)
  * QFX Cinemas - Pokhara (Pokhara)
  * Cinemax - Patan (Lalitpur)
- ${allScreens.length} Screens created (IMAX, 4DX, Standard)
- ${totalSeats} Total Seats with 3 categories each (Premium ₹800-1200, Standard ₹600, Economy ₹400)
- ${createdMovies.length} Movies with rich metadata and gallery:
  * Pathaan (Action/Thriller)
  * Avatar: The Way of Water (Sci-Fi/Adventure)
  * Kantara (Action/Drama)
  * Black Panther: Wakanda Forever (Action/Adventure)
  * Top Gun: Maverick (Action/Drama)
- ${showtimes.length} Showtimes across all theaters and screens
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });