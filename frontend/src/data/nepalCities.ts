export interface City {
  name: string;
  icon: string;
  province: string;
  isPopular: boolean;
}

export const nepalCities: City[] = [
  // Province 1 - Koshi
  { name: 'Biratnagar', icon: '🌉', province: 'Koshi', isPopular: true },
  { name: 'Dharan', icon: '⛰️', province: 'Koshi', isPopular: true },
  { name: 'Itahari', icon: '🌳', province: 'Koshi', isPopular: false },
  { name: 'Inaruwa', icon: '🌾', province: 'Koshi', isPopular: false },
  { name: 'Damak', icon: '🏘️', province: 'Koshi', isPopular: false },
  { name: 'Biratchowk', icon: '🌿', province: 'Koshi', isPopular: false },
  { name: 'Urlabari', icon: '🌄', province: 'Koshi', isPopular: false },
  { name: 'Mechinagar', icon: '🚧', province: 'Koshi', isPopular: false },
  { name: 'Gaighat', icon: '🌊', province: 'Koshi', isPopular: false },
  
  // Province 2 - Madhesh
  { name: 'Janakpur', icon: '🕉️', province: 'Madhesh', isPopular: true },
  { name: 'Birgunj', icon: '🚛', province: 'Madhesh', isPopular: true },
  { name: 'Kalaiya', icon: '🌿', province: 'Madhesh', isPopular: false },
  { name: 'Gaur', icon: '🌾', province: 'Madhesh', isPopular: false },
  { name: 'Rajbiraj', icon: '🏮', province: 'Madhesh', isPopular: false },
  { name: 'Jaleshwar', icon: '🏮', province: 'Madhesh', isPopular: false },
  { name: 'Malangwa', icon: '🌳', province: 'Madhesh', isPopular: false },
  { name: 'Siraha', icon: '🌾', province: 'Madhesh', isPopular: false },
  { name: 'Lahan', icon: '🏞️', province: 'Madhesh', isPopular: false },
  { name: 'Malanchwok', icon: '🌿', province: 'Madhesh', isPopular: false },
  
  // Province 3 - Bagmati (Includes Kathmandu Valley)
  { name: 'Kathmandu', icon: '🏛️', province: 'Bagmati', isPopular: true },
  { name: 'Lalitpur', icon: '🏰', province: 'Bagmati', isPopular: true },
  { name: 'Bhaktapur', icon: '🏮', province: 'Bagmati', isPopular: true },
  { name: 'Hetauda', icon: '🌿', province: 'Bagmati', isPopular: true },
  { name: 'Thimi', icon: '🎭', province: 'Bagmati', isPopular: false },
  { name: 'Banepa', icon: '🏘️', province: 'Bagmati', isPopular: false },
  { name: 'Kirtipur', icon: '⛩️', province: 'Bagmati', isPopular: false },
  { name: 'Sankhu', icon: '🎋', province: 'Bagmati', isPopular: false },
  { name: 'Dakshinkali', icon: '🛕', province: 'Bagmati', isPopular: false },
  { name: 'Madhyapur', icon: '🏛️', province: 'Bagmati', isPopular: false },
  { name: 'Dudhauli', icon: '🌊', province: 'Bagmati', isPopular: false },
  { name: 'Tribhuwan Highway', icon: '🛣️', province: 'Bagmati', isPopular: false },
  
  // Province 4 - Gandaki
  { name: 'Pokhara', icon: '🏔️', province: 'Gandaki', isPopular: true },
  { name: 'Baglung', icon: '⛰️', province: 'Gandaki', isPopular: false },
  { name: 'Beni', icon: '🌊', province: 'Gandaki', isPopular: false },
  { name: 'Kushma', icon: '🌉', province: 'Gandaki', isPopular: false },
  { name: 'Gorkha', icon: '🗡️', province: 'Gandaki', isPopular: false },
  { name: 'Damauli', icon: '🌳', province: 'Gandaki', isPopular: false },
  { name: 'Dulegauda', icon: '🏞️', province: 'Gandaki', isPopular: false },
  
  // Province 5 - Lumbini
  { name: 'Butwal', icon: '🌲', province: 'Lumbini', isPopular: true },
  { name: 'Bhairahawa', icon: '🌅', province: 'Lumbini', isPopular: true },
  { name: 'Siddharthanagar', icon: '🕌', province: 'Lumbini', isPopular: false },
  { name: 'Gulariya', icon: '🌾', province: 'Lumbini', isPopular: false },
  { name: 'Tamghas', icon: '⛰️', province: 'Lumbini', isPopular: false },
  { name: 'Tansen', icon: '🏛️', province: 'Lumbini', isPopular: false },
  { name: 'Musikot', icon: '🌿', province: 'Lumbini', isPopular: false },
  
  // Province 6 - Karnali
  { name: 'Birendranagar', icon: '🏔️', province: 'Karnali', isPopular: false },
  { name: 'Manma', icon: '⛰️', province: 'Karnali', isPopular: false },
  { name: 'Jumla', icon: '🏞️', province: 'Karnali', isPopular: false },
  { name: 'Dunai', icon: '🌊', province: 'Karnali', isPopular: false },
  
  // Province 7 - Sudurpashchim
  { name: 'Nepalgunj', icon: '🌅', province: 'Sudurpashchim', isPopular: true },
  { name: 'Dhangadhi', icon: '🌳', province: 'Sudurpashchim', isPopular: true },
  { name: 'Mahendranagar', icon: '🌾', province: 'Sudurpashchim', isPopular: false },
  { name: 'Tikapur', icon: '🌿', province: 'Sudurpashchim', isPopular: false },
  { name: 'Bhimdatta', icon: '🌊', province: 'Sudurpashchim', isPopular: false },
  { name: 'Attariya', icon: '🛣️', province: 'Sudurpashchim', isPopular: false },
  
  // Popular Tourist Cities
  { name: 'Chitwan', icon: '🦏', province: 'Bagmati', isPopular: true },
  { name: 'Lumbini', icon: '🪷', province: 'Lumbini', isPopular: true },
  { name: 'Bandipur', icon: '🏘️', province: 'Gandaki', isPopular: false },
  { name: 'Ghandruk', icon: '⛰️', province: 'Gandaki', isPopular: false },
  { name: 'Mustang', icon: '🏔️', province: 'Gandaki', isPopular: false },
  { name: 'Annapurna Base Camp', icon: '⛺', province: 'Gandaki', isPopular: false },
];

export const popularCities = nepalCities.filter(city => city.isPopular);
export const getAllCities = () => nepalCities;

export const getCitiesByProvince = (province: string) => {
  return nepalCities.filter(city => city.province === province);
};

export const getProvinces = () => {
  return [...new Set(nepalCities.map(city => city.province))];
};
