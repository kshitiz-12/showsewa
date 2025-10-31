export interface Theater {
  id: string;
  name: string;
  nameNe?: string;
  city: string;
  area: string;
  address: string;
  phone?: string;
  email?: string;
  screens: number;
  amenities: string[];
  isActive: boolean;
  landmark?: string;
}

export const nepalTheaters: Theater[] = [
  // Kathmandu Theaters
  {
    id: 'ktm-qfx',
    name: 'QFX Cinemas - Civil Mall',
    city: 'Kathmandu',
    area: 'Sundhara',
    address: 'Civil Mall, Sundhara',
    phone: '01-4111111',
    email: 'info@qfxcinemas.com',
    screens: 8,
    amenities: ['Dolby Atmos', '4K Projection', 'Premium Seats', 'Food Court'],
    isActive: true
  },
  {
    id: 'ktm-qub',
    name: 'QFX Cinemas - Labim Mall',
    city: 'Kathmandu',
    area: 'Pulchowk',
    address: 'Labim Mall, Pulchowk',
    phone: '01-5533333',
    screens: 6,
    amenities: ['IMAX', 'Premium Seats', 'Online Booking', 'Snacks Bar'],
    isActive: true
  },
  {
    id: 'ktm-cine',
    name: 'Cine de Chef',
    city: 'Kathmandu',
    area: 'Durbar Marg',
    address: 'Durbar Marg, Kathmandu',
    phone: '01-4410420',
    screens: 4,
    amenities: ['Fine Dining', 'Luxury Seats', 'VIP Lounge', 'Parking'],
    isActive: true
  },
  {
    id: 'ktm-fcube',
    name: 'FCube Cinemas',
    city: 'Kathmandu',
    area: 'Dillibazar',
    address: 'Dillibazar, Kathmandu',
    phone: '01-4410222',
    screens: 3,
    amenities: ['Standard Seats', 'Online Booking', 'Parking'],
    isActive: true
  },
  {
    id: 'ktm-big',
    name: 'Big Movies',
    city: 'Kathmandu',
    area: 'New Road',
    address: 'New Road, Kathmandu',
    phone: '01-4412345',
    screens: 2,
    amenities: ['Standard Seats', 'Budget Friendly', 'Food Court'],
    isActive: true
  },

  // Lalitpur Theaters
  {
    id: 'lal-qfx',
    name: 'QFX Cinemas - Jai Nepal Hall',
    city: 'Lalitpur',
    area: 'Patan',
    address: 'Patan, Lalitpur',
    phone: '01-5523456',
    screens: 5,
    amenities: ['Standard Seats', 'Online Booking', 'Parking'],
    isActive: true
  },
  {
    id: 'lal-movietime',
    name: 'Movie Time Cinema',
    city: 'Lalitpur',
    area: 'Jawalakhel',
    address: 'Jawalakhel, Lalitpur',
    phone: '01-5534567',
    screens: 3,
    amenities: ['Standard Seats', 'Food Court'],
    isActive: true
  },

  // Bhaktapur Theaters
  {
    id: 'bhak-kamal',
    name: 'Kamal Cinema Hall',
    city: 'Bhaktapur',
    area: 'Durbar Square',
    address: 'Bhaktapur Durbar Square Area',
    phone: '01-6612345',
    screens: 2,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },

  // Pokhara Theaters
  {
    id: 'pok-qfx',
    name: 'QFX Cinemas - Pokhara',
    city: 'Pokhara',
    area: 'Lakeside',
    address: 'Lakeside, Pokhara',
    phone: '061-463888',
    screens: 4,
    amenities: ['Premium Seats', 'Online Booking', 'Parking', 'Food Court'],
    isActive: true
  },
  {
    id: 'pok-pokhara',
    name: 'Pokhara Multiplex',
    city: 'Pokhara',
    area: 'Chipledhunga',
    address: 'Chipledhunga, Pokhara',
    phone: '061-464444',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },

  // Biratnagar Theaters
  {
    id: 'bit-ashirwad',
    name: 'Ashirwad Cinema Hall',
    city: 'Biratnagar',
    area: 'City Center',
    address: 'City Center, Biratnagar',
    phone: '021-435678',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },
  {
    id: 'bit-ratna',
    name: 'Ratna Cinema Hall',
    city: 'Biratnagar',
    area: 'Bhanu Chowk',
    address: 'Bhanu Chowk, Biratnagar',
    screens: 2,
    amenities: ['Standard Seats'],
    isActive: true
  },

  // Butwal Theaters
  {
    id: 'but-gold',
    name: 'Gold Cinema',
    city: 'Butwal',
    area: 'Main Road',
    address: 'Main Road, Butwal',
    phone: '071-451234',
    screens: 2,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },
  {
    id: 'but-rama',
    name: 'Rama Cinema Hall',
    city: 'Butwal',
    area: 'Tilottama',
    address: 'Tilottama, Butwal',
    screens: 2,
    amenities: ['Standard Seats'],
    isActive: true
  },

  // Nepalgunj Theaters
  {
    id: 'nep-gold',
    name: 'Gold Multiplex',
    city: 'Nepalgunj',
    area: 'New Road',
    address: 'New Road, Nepalgunj',
    phone: '081-523456',
    screens: 4,
    amenities: ['Premium Seats', 'Online Booking', 'Parking'],
    isActive: true
  },
  {
    id: 'nep-central',
    name: 'Central Cinema Hall',
    city: 'Nepalgunj',
    area: 'City Center',
    address: 'City Center, Nepalgunj',
    screens: 2,
    amenities: ['Standard Seats'],
    isActive: true
  },

  // Dhangadhi Theaters
  {
    id: 'dha-city',
    name: 'City Cinema',
    city: 'Dhangadhi',
    area: 'Main Road',
    address: 'Main Road, Dhangadhi',
    phone: '091-523456',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },

  // Chitwan Theaters
  {
    id: 'chi-sun',
    name: 'Sun Rise Cinema',
    city: 'Chitwan',
    area: 'Narayangadh',
    address: 'Narayangadh, Chitwan',
    phone: '056-552234',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },

  // Bhairahawa Theaters
  {
    id: 'bha-buddha',
    name: 'Buddha Multiplex',
    city: 'Bhairahawa',
    area: 'Lumbini Highway',
    address: 'Lumbini Highway, Bhairahawa',
    phone: '071-556789',
    screens: 4,
    amenities: ['Premium Seats', 'Online Booking', 'Parking'],
    isActive: true
  },

  // Birgunj Theaters
  {
    id: 'bir-kumar',
    name: 'Kumar Cinema Hall',
    city: 'Birgunj',
    area: 'Adarsh Nagar',
    address: 'Adarsh Nagar, Birgunj',
    phone: '051-524567',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },

  // Janakpur Theaters
  {
    id: 'jan-janki',
    name: 'Janki Cinema Hall',
    city: 'Janakpur',
    area: 'Station Road',
    address: 'Station Road, Janakpur',
    phone: '041-465678',
    screens: 2,
    amenities: ['Standard Seats'],
    isActive: true
  },

  // Dharan Theaters
  {
    id: 'dha-dharan',
    name: 'Dharan Cineplex',
    city: 'Dharan',
    area: 'Main Road',
    address: 'Main Road, Dharan',
    phone: '025-523456',
    screens: 3,
    amenities: ['Standard Seats', 'Parking'],
    isActive: true
  },
];

export const getTheatersByCity = (city: string) => {
  return nepalTheaters.filter(theater => theater.city.toLowerCase() === city.toLowerCase());
};

export const getTheaterById = (id: string) => {
  return nepalTheaters.find(theater => theater.id === id);
};

export const getAllTheaters = () => nepalTheaters;
