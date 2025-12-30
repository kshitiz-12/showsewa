import { 
  Landmark, Building2, Mountain, Waves, TreePine, 
  Factory, MapPin, Church, Castle, Tent, Camera, 
  Car, Sun
} from 'lucide-react';

export { MapPin as DefaultCityIcon } from 'lucide-react';

// Mapping of city names to appropriate landmark icons
export const cityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Province 1 - Koshi
  'Biratnagar': Factory,
  'Dharan': Mountain,
  'Itahari': TreePine,
  'Inaruwa': Waves,
  'Damak': Building2,
  'Biratchowk': MapPin,
  'Urlabari': Sun,
  'Mechinagar': Car,
  'Gaighat': Waves,
  
  // Province 2 - Madhesh
  'Janakpur': Landmark,
  'Birgunj': Factory,
  'Kalaiya': TreePine,
  'Gaur': Building2,
  'Rajbiraj': Landmark,
  'Jaleshwar': Landmark,
  'Malangwa': TreePine,
  'Siraha': Building2,
  'Lahan': MapPin,
  'Malanchwok': TreePine,
  
  // Province 3 - Bagmati
  'Kathmandu': Landmark,
  'Lalitpur': Castle,
  'Bhaktapur': Landmark,
  'Hetauda': Building2,
  'Thimi': Camera,
  'Banepa': Building2,
  'Kirtipur': Landmark,
  'Sankhu': Landmark,
  'Dakshinkali': Church,
  'Madhyapur': Building2,
  'Dudhauli': Waves,
  'Tribhuwan Highway': Car,
  
  // Province 4 - Gandaki
  'Pokhara': Mountain,
  'Baglung': Mountain,
  'Beni': Waves,
  'Kushma': Mountain,
  'Gorkha': Castle,
  'Damauli': TreePine,
  'Dulegauda': Mountain,
  
  // Province 5 - Lumbini
  'Butwal': Building2,
  'Bhairahawa': Sun,
  'Siddharthanagar': Landmark,
  'Gulariya': Building2,
  'Tamghas': Mountain,
  'Tansen': Landmark,
  'Musikot': TreePine,
  
  // Province 6 - Karnali
  'Birendranagar': Mountain,
  'Manma': Mountain,
  'Jumla': Mountain,
  'Dunai': Waves,
  
  // Province 7 - Sudurpashchim
  'Nepalgunj': Building2,
  'Dhangadhi': TreePine,
  'Mahendranagar': Building2,
  'Tikapur': TreePine,
  'Bhimdatta': Waves,
  'Attariya': Car,
  
  // Tourist Cities
  'Chitwan': TreePine,
  'Lumbini': Landmark,
  'Bandipur': Building2,
  'Ghandruk': Mountain,
  'Mustang': Mountain,
  'Annapurna Base Camp': Tent,
};
