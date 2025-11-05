import { Ticket, Facebook, Instagram, Twitter, Mail, Smartphone, MapPin, Phone, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();

  const quickLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'events', label: t('nav.events') },
    { id: 'movies', label: t('nav.movies') },
    { id: 'partners', label: t('nav.partners') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white pt-6 sm:pt-10 pb-4 sm:pb-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 sm:p-2.5 rounded-xl shadow-lg">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold">
                Show<span className="text-red-500">Sewa</span>
              </span>
            </div>
            <p className="text-gray-300 mb-3 sm:mb-4 max-w-md text-xs sm:text-sm">
              {t('footer.tagline')}
            </p>
            
            {/* Social Media */}
            <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <a
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.instagram.com/showsewa?igsh=bGZ6ZjRxZXUycncx"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xs sm:text-sm">+977 98-00000000</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xs sm:text-sm">info@showsewa.com</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xs sm:text-sm">Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></span>
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-gray-300 hover:text-red-500 hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group text-xs sm:text-sm"
                  >
                    <span className="w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-3"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></span>
              {t('home.download_app')}
            </h3>
            <div className="space-y-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 sm:p-3 rounded-lg border border-gray-700 hover:border-red-600 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-semibold text-xs">Coming Soon</p>
                    <p className="text-gray-400 text-xs">{t('footer.download_soon')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-3 sm:pt-4 mt-3 sm:mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3 text-xs text-gray-400">
            <p className="flex items-center gap-1.5">
              © 2024 ShowSewa. Made with{' '}
              <Heart className="w-3.5 h-3.5 text-red-500 inline-block fill-red-500" />{' '}
              in Nepal
            </p>
            <div className="flex gap-4">
              <button className="hover:text-red-500 transition-colors">Privacy</button>
              <button className="hover:text-red-500 transition-colors">Terms</button>
              <button className="hover:text-red-500 transition-colors">Support</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
