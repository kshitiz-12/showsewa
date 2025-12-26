import { useState, useEffect, useRef } from 'react';
import { Sparkles, Target, Users, Calendar, Heart, Award, Zap, Globe, Star, Film, Music, Ticket, ArrowRight, TrendingUp, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function About() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all refs
    const refsToObserve = Object.values(sectionRefs.current);
    refsToObserve.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section - World Class */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-400/20 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/10 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/30 rounded-lg transform rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 border-2 border-white/30 rounded-lg transform -rotate-12 animate-pulse"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 py-24">
          {/* Floating Icon */}
          <div className="inline-block mb-8 transform hover:scale-110 transition-transform duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-60 animate-pulse"></div>
              <Sparkles className="w-20 h-20 text-yellow-400 relative z-10 drop-shadow-2xl animate-float" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
            <span className="block transform hover:scale-105 transition-transform duration-500 inline-block">
              {t('about.title')}
            </span>
          </h1>

          {/* Tagline */}
          <div className="mb-12">
            <p className="text-2xl md:text-3xl font-light text-red-100 max-w-4xl mx-auto leading-relaxed tracking-wide">
              Tapai ko Show, Hamro Sewa
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {[
              { id: 'movies', icon: Film, text: 'Movies' },
              { id: 'events', icon: Music, text: 'Events' },
              { id: 'booking', icon: Ticket, text: 'Easy Booking' }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/15 backdrop-blur-xl rounded-full px-6 py-3 text-white border-2 border-white/40 transform hover:scale-110 hover:bg-white/25 transition-all duration-500 shadow-2xl hover:shadow-white/20 flex items-center gap-2">
                    <IconComponent className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-500" />
                    <span className="font-semibold text-base tracking-wide">
                      {item.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowRight className="w-8 h-8 text-white/70 transform rotate-90" />
          </div>
        </div>
      </section>

      {/* Feature Cards - Creative Layout */}
      <section className="py-20 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            id="features-header"
            ref={setRef('features-header')}
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <span className="text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Excellence Defined
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto"></div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { id: 'mission', icon: Target, title: 'Our Mission', text: t('about.mission_text'), gradient: 'from-red-500 to-red-700', delay: '0s' },
              { id: 'fast-easy', icon: Zap, title: 'Lightning Fast', text: 'Book your favorite movies and events in just a few clicks, anytime, anywhere', gradient: 'from-yellow-500 to-orange-500', delay: '0.2s' },
              { id: 'nationwide', icon: Globe, title: 'Nationwide Reach', text: 'Connecting entertainment lovers from all corners of Nepal in one platform', gradient: 'from-blue-500 to-indigo-600', delay: '0.4s' }
            ].map((item) => {
              const IconComponent = item.icon;
              const isCardVisible = isVisible[`feature-card-${item.id}`];
              return (
                <div
                  key={item.id}
                  id={`feature-card-${item.id}`}
                  ref={setRef(`feature-card-${item.id}`)}
                  className={`group relative transform transition-all duration-700 ease-out ${
                    isCardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
                  }`}
                  style={{ transitionDelay: isCardVisible ? item.delay : '0s' }}
                >
                  {/* Card Glow Effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 h-full border border-gray-200 dark:border-gray-700 transform transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
                    {/* Icon Container */}
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <div className={`relative w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                        <IconComponent className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-yellow-900" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.text}
                    </p>

                    {/* Decorative Line */}
                    <div className="mt-6 w-12 h-0.5 bg-gradient-to-r from-red-500 to-transparent transform group-hover:scale-x-150 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Vision & Mission - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {/* Vision Section */}
            <div
              id="vision-section"
              ref={setRef('vision-section')}
              className={`relative transform transition-all duration-700 ease-out ${
                isVisible['vision-section'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            >
              <div className="relative h-full bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-red-200 dark:border-red-900/50 shadow-xl overflow-hidden group hover:shadow-red-500/20 transition-shadow duration-500">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-yellow-200/20 dark:bg-yellow-900/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                      {t('about.vision_title')}
                    </h2>
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-red-600 to-transparent mb-6"></div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('about.vision_text')}
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div
              id="mission-section"
              ref={setRef('mission-section')}
              className={`relative transform transition-all duration-700 ease-out ${
                isVisible['mission-section'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              <div className="relative h-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-gray-300 dark:border-gray-600 shadow-xl overflow-hidden group hover:shadow-gray-500/20 transition-shadow duration-500">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-gray-200/30 dark:bg-gray-700/30 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 right-0 w-36 h-36 bg-red-200/20 dark:bg-red-900/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                      {t('about.mission_title')}
                    </h2>
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-gray-700 to-transparent dark:from-gray-400 mb-6"></div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('about.mission_text')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About ShowSewa - Full Width Creative */}
          <div
            id="about-section"
            ref={setRef('about-section')}
            className={`relative mb-20 transform transition-all duration-700 ease-out ${
              isVisible['about-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 md:p-12 border-2 border-gray-200 dark:border-gray-700 overflow-hidden group">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-50/50 dark:from-red-900/10 dark:via-transparent dark:to-red-900/10 opacity-50"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-100/30 dark:bg-red-900/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Decorative Elements */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-red-600"></div>
                  <Shield className="w-8 h-8 text-red-600 transform group-hover:rotate-12 transition-transform duration-500" />
                  <div className="w-12 h-0.5 bg-gradient-to-r from-red-600 via-red-600 to-transparent"></div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">
                  About ShowSewa
                </h2>
                
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.about_text')}
                </p>
              </div>
            </div>
          </div>

          {/* Founders Section - Premium Design */}
          <div
            id="founders-section"
            ref={setRef('founders-section')}
            className={`mb-20 transform transition-all duration-700 ease-out ${
              isVisible['founders-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-red-600"></div>
                <Users className="w-10 h-10 text-red-600 transform hover:scale-110 transition-transform duration-300" />
                <div className="w-12 h-0.5 bg-gradient-to-r from-red-600 via-red-600 to-transparent"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                {t('about.founders_title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                The passionate minds behind ShowSewa
              </p>
            </div>
            
            {/* Founders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  id: 'founder-1',
                  initials: 'TG', 
                  name: t('about.founder_1_name'), 
                  role: t('about.founder_1_role'), 
                  about: t('about.founder_1_about'),
                  delay: '0s'
                },
                { 
                  id: 'founder-2',
                  initials: 'V', 
                  name: t('about.founder_2_name'), 
                  role: t('about.founder_2_role'), 
                  about: t('about.founder_2_about'),
                  delay: '0.3s'
                }
              ].map((founder) => {
                const isFounderVisible = isVisible[`${founder.id}`];
                return (
                  <div
                    key={founder.id}
                    id={`${founder.id}`}
                    ref={setRef(`${founder.id}`)}
                    className={`group relative transform transition-all duration-700 ease-out ${
                      isFounderVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
                    }`}
                    style={{ transitionDelay: isFounderVisible ? founder.delay : '0s' }}
                  >
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    
                    <div className="relative bg-gradient-to-br from-white via-red-50/30 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-red-100 dark:border-red-900/50 transform transition-all duration-500 hover:-translate-y-4 hover:shadow-xl overflow-hidden">
                      {/* Background Decoration */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-red-200/20 dark:bg-red-900/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-36 h-36 bg-yellow-200/10 dark:bg-yellow-900/10 rounded-full blur-3xl"></div>
                      
                      <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative mb-6">
                          {/* Outer Glow Ring */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 scale-125"></div>
                          
                          {/* Avatar Circle */}
                          <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full mx-auto flex items-center justify-center shadow-xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                            <span className="text-4xl font-black text-white z-10">{founder.initials}</span>
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                          </div>
                          
                          {/* Award Badge */}
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border-2 border-white dark:border-gray-800">
                            <Award className="w-6 h-6 text-yellow-900" />
                          </div>
                          
                          {/* Floating Particles */}
                          <div className="absolute -top-2 -left-2 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
                          <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                        </div>

                        {/* Name */}
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                          {founder.name}
                        </h3>
                        
                        {/* Role */}
                        <div className="mb-4">
                          <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
                            <p className="text-red-100 font-bold text-sm">
                              {founder.role}
                            </p>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-6 transform group-hover:scale-x-150 transition-transform duration-500"></div>
                        
                        {/* About */}
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                          {founder.about}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Date - Premium CTA */}
          <div
            id="launch-section"
            ref={setRef('launch-section')}
            className={`relative mb-20 transform transition-all duration-700 ease-out ${
              isVisible['launch-section'] ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-16'
            }`}
          >
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl shadow-xl p-12 text-center overflow-hidden group">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-48 h-48 bg-red-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-400/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-block mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                    <div className="relative bg-yellow-400 rounded-full p-4 shadow-xl">
                      <Calendar className="w-10 h-10 text-red-700" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 transform group-hover:scale-105 transition-transform duration-300">
                  {t('about.launch_date')}
                </h2>

                {/* Description */}
                <p className="text-xl text-red-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                  Get ready for the future of entertainment booking in Nepal
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { id: 'launch-movies', icon: Film, label: 'Movies' },
                    { id: 'launch-events', icon: Music, label: 'Events' },
                    { id: 'launch-booking', icon: Ticket, label: 'Easy Booking' }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="group/item relative"
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover/item:blur-2xl transition-all duration-500 opacity-0 group-hover/item:opacity-100"></div>
                        <div className="relative bg-white/20 backdrop-blur-xl rounded-full px-6 py-3 text-white font-semibold text-base border-2 border-white/40 transform hover:scale-110 hover:bg-white/30 transition-all duration-500 shadow-lg flex items-center gap-2">
                          <IconComponent className="w-4 h-4 transform group-hover/item:rotate-12 transition-transform duration-500" />
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Design */}
      <section
        id="cta-section"
        ref={setRef('cta-section')}
        className={`py-32 transform transition-all duration-700 ease-out ${
          isVisible['cta-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl p-20 overflow-hidden group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="relative z-10 text-center">
              {/* Hearts */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <Heart className="w-12 h-12 text-white fill-white transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                <TrendingUp className="w-16 h-16 text-yellow-400 transform group-hover:scale-125 transition-all duration-500" />
                <Heart className="w-12 h-12 text-white fill-white transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500" />
              </div>

              {/* Title */}
              <h2 className="text-6xl md:text-7xl font-black text-white mb-10 transform group-hover:scale-105 transition-transform duration-300">
                Join the ShowSewa Revolution
              </h2>

              {/* Description */}
              <p className="text-3xl text-red-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
                Experience the easiest way to book movies and events in Nepal
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap justify-center gap-6">
                <button className="group/btn relative overflow-hidden bg-white text-red-600 font-black px-12 py-6 rounded-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-2xl hover:shadow-white/30 text-xl">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Booking
                    <ArrowRight className="w-6 h-6 transform group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                </button>
                
                <button className="group/btn relative overflow-hidden bg-transparent border-4 border-white text-white font-black px-12 py-6 rounded-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 text-xl backdrop-blur-sm hover:bg-white hover:text-red-600">
                  <span className="relative z-10">Learn More</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
