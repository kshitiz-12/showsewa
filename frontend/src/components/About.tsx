import { Sparkles, Target, Users, Calendar, Heart, Award, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function About() {
  const { t } = useLanguage();

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
            <Sparkles className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 animate-page-fade-in">
            {t('about.title')}
          </h1>
          <p className="text-2xl text-red-100 max-w-3xl mx-auto mb-8 animate-page-fade-in" style={{ animationDelay: '0.1s' }}>
            Nepal's Premier Digital Ticketing Platform
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-page-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <span className="font-semibold">🎬 Movies</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <span className="font-semibold">🎭 Events</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <span className="font-semibold">🎟️ Easy Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Making entertainment accessible to everyone across Nepal with seamless digital experiences
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fast & Easy</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Book your favorite movies and events in just a few clicks, anytime, anywhere
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nationwide</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Connecting entertainment lovers from all corners of Nepal in one platform
              </p>
            </div>
          </div>
          
          {/* Vision Section */}
          <div className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-2xl p-10 md:p-12 mb-12 border border-red-100 dark:border-gray-600">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {t('about.vision_title')}
              </h2>
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.vision_text')}
            </p>
          </div>

          {/* Founders Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 md:p-12 mb-12 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <Users className="w-10 h-10 text-red-600" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t('about.founders_title')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                The passionate minds behind ShowSewa
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Founder 1 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-red-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border border-red-100 dark:border-gray-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-40 h-40 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full mx-auto flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-300">
                        <span className="text-4xl font-bold text-white">TG</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-yellow-800" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {t('about.founder_1_name')}
                    </h3>
                    <p className="text-red-600 font-semibold text-lg mb-4">
                      {t('about.founder_1_role')}
                    </p>
                    <div className="flex gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <Heart className="w-5 h-5 text-red-500" />
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder 2 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-red-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border border-red-100 dark:border-gray-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-40 h-40 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full mx-auto flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-300">
                        <span className="text-6xl font-bold text-white">V</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-yellow-800" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {t('about.founder_2_name')}
                    </h3>
                    <p className="text-red-600 font-semibold text-lg mb-4">
                      {t('about.founder_2_role')}
                    </p>
                    <div className="flex gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <Heart className="w-5 h-5 text-red-500" />
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Date Section */}
          <div className="relative overflow-hidden">
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl p-12 text-center relative">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400 rounded-full translate-x-1/2 translate-y-1/2 opacity-20"></div>
              
              <div className="relative z-10">
                <div className="inline-block p-4 bg-yellow-400 rounded-full mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <Calendar className="w-12 h-12 text-red-700" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {t('about.launch_date')}
                </h2>
                <p className="text-red-100 text-xl mb-6 max-w-2xl mx-auto">
                  Get ready for the future of entertainment booking in Nepal
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white font-semibold">
                    🎬 Movies
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white font-semibold">
                    🎭 Events
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white font-semibold">
                    🎟️ Easy Booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-5xl font-bold text-white mb-6">
              Join the ShowSewa Revolution
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Experience the easiest way to book movies and events in Nepal
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Booking
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
