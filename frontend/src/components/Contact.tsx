import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Contact() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      alert('Message sent successfully! We will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-800 py-24 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <MessageCircle className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 animate-page-fade-in">
            {t('contact.title')}
          </h1>
          <p className="text-2xl text-red-100 max-w-3xl mx-auto mb-8 animate-page-fade-in" style={{ animationDelay: '0.1s' }}>
            {t('contact.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-page-fade-in" style={{ animationDelay: '0.2s' }}>
            <a
              href="mailto:info@showsewa.com"
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110 shadow-lg"
              aria-label="Email Us"
            >
              <Mail className="w-6 h-6" />
            </a>
            <a
              href="tel:+9779800000000"
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110 shadow-lg"
              aria-label="Call Us"
            >
              <Phone className="w-6 h-6" />
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Kathmandu,Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110 shadow-lg"
              aria-label="Visit Us"
            >
              <MapPin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-10 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Send us a message
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500 transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('contact.message')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500 transition-all duration-200 resize-none"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : t('contact.send')}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-2xl p-10 border border-red-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Get in touch
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-5 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                      {t('contact.email_us')}
                    </h3>
                    <a
                      href="mailto:info@showsewa.com"
                      className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                    >
                      info@showsewa.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                      Call Us
                    </h3>
                    <a
                      href="tel:+9779800000000"
                      className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                    >
                      +977 98-00000000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                      Location
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Kathmandu, Nepal
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('contact.follow_us')}
                </h2>
              </div>
              <div className="flex gap-4 justify-center">
                <a
                  href="#"
                  className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  aria-label="Facebook"
                >
                  <Facebook className="w-7 h-7 text-white" />
                </a>
                <a
                  href="#"
                  className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  aria-label="Instagram"
                >
                  <Instagram className="w-7 h-7 text-white" />
                </a>
                <a
                  href="#"
                  className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  aria-label="Twitter"
                >
                  <Twitter className="w-7 h-7 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
