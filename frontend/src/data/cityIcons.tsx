import { 
  Landmark, Building2, Mountain, Waves, TreePine, 
  Factory, MapPin, Church, Castle, Tent, Camera, 
  Car, Sun
} from 'lucide-react';

// Map of Nepal Icon Component
const NepalMapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8 2 5 4 5 7C5 9 6 11 8 12C6 13 5 15 5 17C5 20 8 22 12 22C16 22 19 20 19 17C19 15 18 13 16 12C18 11 19 9 19 7C19 4 16 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 7L10 10L12 13L14 10L12 7Z" fill="currentColor"/>
  </svg>
);

export { NepalMapIcon as DefaultCityIcon };

// Map of Nepal Icon Component - used for all cities
const NepalMapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8 2 5 4 5 7C5 9 6 11 8 12C6 13 5 15 5 17C5 20 8 22 12 22C16 22 19 20 19 17C19 15 18 13 16 12C18 11 19 9 19 7C19 4 16 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 7L10 10L12 13L14 10L12 7Z" fill="currentColor"/>
  </svg>
);

// All cities use the Map of Nepal icon
export const cityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {};
