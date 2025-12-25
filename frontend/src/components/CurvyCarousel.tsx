import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Calendar, MapPin, Star } from 'lucide-react';

interface CarouselItem {
  id: string;
  title: string;
  titleNe?: string;
  description?: string;
  descriptionNe?: string;
  image: string;
  type: 'movie' | 'event';
  genre?: string;
  rating?: string;
  venue?: string;
  venueNe?: string;
  date?: string;
  price?: string;
  trailerUrl?: string;
}

interface CurvyCarouselProps {
  items: CarouselItem[];
  onItemClick: (item: CarouselItem) => void;
  language?: 'en' | 'ne';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  variant?: 'hero' | 'section';
}

export const CurvyCarousel: React.FC<CurvyCarouselProps> = ({
  items,
  onItemClick,
  language = 'en',
  autoPlay = true,
  autoPlayInterval = 5000,
  variant = 'hero'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && items.length > 1) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, currentIndex, items.length]);

  const nextSlide = () => {
    if (isTransitioning || items.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning || items.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex || items.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const height = variant === 'hero' ? 'h-[600px] sm:h-[600px]' : 'h-[400px] sm:h-[450px] md:h-[500px]';
  const containerClasses = variant === 'hero' 
    ? 'relative h-[600px] w-full overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-gray-900'
    : 'relative h-[400px] sm:h-[450px] md:h-[500px] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-gray-900 shadow-2xl';

  if (!items.length) {
    return (
      <div className={`${height} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No content available</p>
        </div>
      </div>
    );
  }

  // Get the current, previous, and next items for smooth transitions
  const getVisibleItems = () => {
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    
    return {
      prev: items[prevIndex],
      current: items[currentIndex],
      next: items[nextIndex]
    };
  };

  const visibleItems = getVisibleItems();
  const currentItem = items[currentIndex];

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  return (
    <div className={containerClasses}>
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {/* Previous Image */}
        <div 
          className="absolute inset-0 opacity-30 scale-110 blur-sm transition-all duration-1000 ease-out"
          style={{
            backgroundImage: `url(${visibleItems.prev.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'translateX(-10px)'
          }}
        />
        
        {/* Current Image */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            backgroundImage: `url(${visibleItems.current.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Next Image */}
        <div 
          className="absolute inset-0 opacity-30 scale-110 blur-sm transition-all duration-1000 ease-out"
          style={{
            backgroundImage: `url(${visibleItems.next.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'translateX(10px)'
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Content */}
            <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-xs sm:text-sm font-medium">
                    {currentItem.type === 'movie' ? 'Featured Movie' : 'Featured Event'}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  {language === 'en' ? currentItem.title : (currentItem.titleNe || currentItem.title)}
                </h2>

                {/* Description */}
                {(currentItem.description || currentItem.descriptionNe) && (
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {language === 'en' ? currentItem.description : (currentItem.descriptionNe || currentItem.description)}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-gray-200 text-xs sm:text-sm">
                  {currentItem.genre && (
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-red-400" />
                      <span>{currentItem.genre}</span>
                    </div>
                  )}
                  
                  {currentItem.rating && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-600 rounded text-sm font-semibold">
                        {currentItem.rating}
                      </span>
                    </div>
                  )}
                  
                  {currentItem.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span>{language === 'en' ? currentItem.venue : (currentItem.venueNe || currentItem.venue)}</span>
                    </div>
                  )}
                  
                  {currentItem.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-400" />
                      <span>{new Date(currentItem.date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {currentItem.price && (
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">
                    {currentItem.price}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => onItemClick(currentItem)}
                className="group bg-white text-red-600 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 sm:gap-3 shadow-xl w-fit"
              >
                <span>Book Now</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Side - Curvy Image Container */}
            <div className="relative hidden lg:block">
              <div className={`relative w-full ${variant === 'hero' ? 'h-[400px] lg:h-[500px]' : 'h-[350px] lg:h-[400px]'}`}>
                {/* Curvy Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-[30px] sm:rounded-[40px] p-4 sm:p-6 lg:p-8">
                  <div className="relative h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                    {/* Show Trailer if available, otherwise show poster */}
                    {currentItem.trailerUrl ? (
                      <>
                        {(() => {
                          const videoId = extractYouTubeVideoId(currentItem.trailerUrl);
                          if (videoId) {
                            return (
                              <div className="w-full h-full">
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`}
                                  className="w-full h-full object-cover"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ border: 'none' }}
                                />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    ) : currentItem.image ? (
                      <img
                        src={currentItem.image}
                        alt={language === 'en' ? currentItem.title : (currentItem.titleNe || currentItem.title)}
                        className="w-full h-full object-cover transition-all duration-1000 ease-out"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback Placeholder */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-gray-900 flex flex-col items-center justify-center ${
                      (currentItem.image || currentItem.trailerUrl) ? 'hidden' : ''
                    }`}>
                      <div className="relative w-32 h-32 mb-4">
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"></div>
                        <div className="absolute inset-4 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Play className="w-16 h-16 text-white" />
                        </div>
                      </div>
                      <p className="text-white/90 text-sm font-medium text-center px-4">
                        {language === 'en' ? currentItem.title : (currentItem.titleNe || currentItem.title)}
                      </p>
                    </div>
                    
                    {/* Play Button Overlay on Poster */}
                    {currentItem.image && !currentItem.trailerUrl && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-300 cursor-pointer">
                          <Play className="w-8 h-8 text-red-600 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-red-400/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
          {items.map((item, index) => (
            <button
              key={`indicator-${item.id}-${index}`}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
