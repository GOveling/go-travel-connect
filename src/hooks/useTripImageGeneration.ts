
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TripImageCache {
  [key: string]: string;
}

export const useTripImageGeneration = () => {
  const [imageCache, setImageCache] = useState<TripImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // Load cached images from localStorage on mount
  useEffect(() => {
    const cachedImages = localStorage.getItem('tripImageCache');
    if (cachedImages) {
      try {
        setImageCache(JSON.parse(cachedImages));
      } catch (error) {
        console.error('Error loading cached images:', error);
      }
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(imageCache).length > 0) {
      localStorage.setItem('tripImageCache', JSON.stringify(imageCache));
    }
  }, [imageCache]);

  const generateTripImage = async (destination: string, tripName?: string): Promise<string | null> => {
    const cacheKey = `${destination}-${tripName || ''}`.toLowerCase().replace(/\s+/g, '-');
    
    // Return cached image if available
    if (imageCache[cacheKey]) {
      return imageCache[cacheKey];
    }

    // Avoid duplicate requests
    if (loadingImages.has(cacheKey)) {
      return null;
    }

    setLoadingImages(prev => new Set(prev).add(cacheKey));

    try {
      const { data, error } = await supabase.functions.invoke('generate-trip-image', {
        body: { destination, tripName }
      });

      if (error) {
        console.error('Error generating trip image:', error);
        return null;
      }

      if (data?.imageUrl) {
        // Cache the generated image
        setImageCache(prev => ({
          ...prev,
          [cacheKey]: data.imageUrl
        }));
        
        return data.imageUrl;
      }

      return null;
    } catch (error) {
      console.error('Error calling generate-trip-image function:', error);
      return null;
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  };

  const getTripImage = (destination: string, tripName?: string): string | null => {
    const cacheKey = `${destination}-${tripName || ''}`.toLowerCase().replace(/\s+/g, '-');
    return imageCache[cacheKey] || null;
  };

  const isGenerating = (destination: string, tripName?: string): boolean => {
    const cacheKey = `${destination}-${tripName || ''}`.toLowerCase().replace(/\s+/g, '-');
    return loadingImages.has(cacheKey);
  };

  return {
    generateTripImage,
    getTripImage,
    isGenerating,
    imageCache
  };
};
