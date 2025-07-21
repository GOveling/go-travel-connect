
import airportCodes from '@/data/airportCodes.json';

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportMatch {
  airport: Airport;
  score: number;
}

export class AirportMatcher {
  private static instance: AirportMatcher;
  private airportData: Record<string, Airport[]>;

  private constructor() {
    this.airportData = airportCodes as Record<string, Airport[]>;
  }

  static getInstance(): AirportMatcher {
    if (!AirportMatcher.instance) {
      AirportMatcher.instance = new AirportMatcher();
    }
    return AirportMatcher.instance;
  }

  /**
   * Calculate similarity score between two strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Calculate Levenshtein distance
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Find the best matching airport for a city name
   */
  findAirport(cityName: string): Airport | null {
    const matches = this.findAirports(cityName, 1);
    return matches.length > 0 ? matches[0].airport : null;
  }

  /**
   * Find multiple matching airports for a city name
   */
  findAirports(cityName: string, limit: number = 5): AirportMatch[] {
    const normalizedInput = cityName.toLowerCase().trim();
    const matches: AirportMatch[] = [];

    // Direct city name match
    if (this.airportData[normalizedInput]) {
      this.airportData[normalizedInput].forEach(airport => {
        matches.push({ airport, score: 1.0 });
      });
    }

    // Fuzzy search through all cities
    Object.entries(this.airportData).forEach(([cityKey, airports]) => {
      const similarity = this.calculateSimilarity(normalizedInput, cityKey);
      
      if (similarity > 0.6 && similarity < 1.0) { // Avoid duplicates from direct match
        airports.forEach(airport => {
          matches.push({ airport, score: similarity });
        });
      }
    });

    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get airport by IATA code
   */
  getAirportByCode(iataCode: string): Airport | null {
    const code = iataCode.toUpperCase();
    
    for (const airports of Object.values(this.airportData)) {
      for (const airport of airports) {
        if (airport.iata === code) {
          return airport;
        }
      }
    }
    
    return null;
  }

  /**
   * Get all cities that have airports
   */
  getAllCities(): string[] {
    return Object.keys(this.airportData);
  }

  /**
   * Get suggestions for autocomplete
   */
  getSuggestions(query: string, limit: number = 10): { city: string; airports: Airport[] }[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (normalizedQuery.length < 2) return [];
    
    const suggestions: { city: string; airports: Airport[]; score: number }[] = [];
    
    Object.entries(this.airportData).forEach(([cityKey, airports]) => {
      const similarity = this.calculateSimilarity(normalizedQuery, cityKey);
      
      if (similarity > 0.3) {
        suggestions.push({
          city: cityKey,
          airports,
          score: similarity
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ city, airports }) => ({ city, airports }));
  }
}

// Export singleton instance
export const airportMatcher = AirportMatcher.getInstance();
