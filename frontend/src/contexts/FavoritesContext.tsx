import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface FavoritesContextType {
  favoriteTheaterIds: Set<string>;
  toggleFavoriteTheater: (theaterId: string) => void;
  isFavoriteTheater: (theaterId: string) => boolean;
  ratingsByTheaterId: Record<string, number>; // 1-5
  setTheaterRating: (theaterId: string, rating: number) => void;
  getTheaterRating: (theaterId: string) => number;
  clearAllFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'showsewa_favorite_theater_ids';
const RATINGS_STORAGE_KEY = 'showsewa_theater_ratings';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteTheaterIds, setFavoriteTheaterIds] = useState<Set<string>>(new Set());
  const [ratingsByTheaterId, setRatingsByTheaterId] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const arr: string[] = JSON.parse(stored);
        setFavoriteTheaterIds(new Set(arr));
      }
    } catch {}

    try {
      const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
      if (storedRatings) {
        setRatingsByTheaterId(JSON.parse(storedRatings));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteTheaterIds)));
    } catch {}
  }, [favoriteTheaterIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratingsByTheaterId));
    } catch {}
  }, [ratingsByTheaterId]);

  const toggleFavoriteTheater = (theaterId: string) => {
    setFavoriteTheaterIds(prev => {
      const next = new Set(prev);
      if (next.has(theaterId)) next.delete(theaterId); else next.add(theaterId);
      return next;
    });
  };

  const isFavoriteTheater = (theaterId: string) => favoriteTheaterIds.has(theaterId);

  const setTheaterRating = (theaterId: string, rating: number) => {
    const clamped = Math.max(1, Math.min(5, Math.round(rating)));
    setRatingsByTheaterId(prev => ({ ...prev, [theaterId]: clamped }));
  };

  const getTheaterRating = (theaterId: string) => ratingsByTheaterId[theaterId] || 0;

  const clearAllFavorites = () => setFavoriteTheaterIds(new Set());

  const value = useMemo<FavoritesContextType>(() => ({
    favoriteTheaterIds,
    toggleFavoriteTheater,
    isFavoriteTheater,
    ratingsByTheaterId,
    setTheaterRating,
    getTheaterRating,
    clearAllFavorites
  }), [favoriteTheaterIds, ratingsByTheaterId]);

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
