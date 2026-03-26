import { 
  Landmark, Building2, Mountain, Waves, TreePine, 
  Factory, MapPin, Church, Castle, Tent, Camera,
  Car, Sun, Truck, Theater, Building, GraduationCap, Leaf, MapPinned
} from 'lucide-react';

export { MapPinned as DefaultCityIcon };

export const cityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Major cities
  Kathmandu: Landmark,
  Lalitpur: Castle,
  Bhaktapur: Building2,
  Pokhara: Mountain,
  Biratnagar: Building,
  Birgunj: Truck,
  Janakpur: Church,
  Chitwan: TreePine,
  Butwal: Factory,
  Bhairahawa: Sun,
  Nepalgunj: Building2,
  Dhangadhi: Building2,
  Lumbini: Church,

  // Other specific places
  Dharan: Mountain,
  Hetauda: Factory,
  Gorkha: Castle,
  Gulariya: Leaf,
  Jumla: Mountain,
  Mustang: Mountain,
  'Annapurna Base Camp': Tent,
  Bandipur: Camera,
  Ghandruk: Mountain,
  'Tribhuwan Highway': Car,
  Siddharthanagar: Church,
  Kirtipur: GraduationCap,
  Thimi: Theater,
};

const provinceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Koshi: Building2,
  Madhesh: Landmark,
  Bagmati: Landmark,
  Gandaki: Mountain,
  Lumbini: Church,
  Karnali: Mountain,
  Sudurpashchim: Waves,
};

export const getCityIcon = (cityName: string, province: string) => {
  return cityIconMap[cityName] || provinceIconMap[province] || MapPin;
};
