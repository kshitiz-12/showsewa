import React, { createContext, useContext, useState, useEffect } from 'react';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  getTheatersInCity: () => any[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCity] = useState(''); // Default to empty (show all cities)

  useEffect(() => {
    // Load saved city from localStorage, but if it's empty/null, default to '' (show all)
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity && savedCity.trim() !== '') {
      setSelectedCity(savedCity);
    } else {
      setSelectedCity(''); // Default to empty (show all)
    }
  }, []);

  const getTheatersInCity = () => {
    // Import theaters data dynamically to avoid circular imports
    import('../data/nepalTheaters').then(({ getTheatersByCity }) => {
      return getTheatersByCity(selectedCity);
    });
    return [];
  };

  const handleSetSelectedCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    // Dispatch event for components that listen to city changes
    window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city } }));
  };

  return (
    <CityContext.Provider value={{
      selectedCity,
      setSelectedCity: handleSetSelectedCity,
      getTheatersInCity
    }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}

