import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from "axios";
import { store } from "../store";
import { setError as setAuthError } from "../store/slices/authSlice";
import { ApiResponse, ApiError } from "./types";
import { supabase } from "@/integrations/supabase/client";

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = "https://goveling-api.onrender.com";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add Bearer token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const { data } = await supabase.auth.getSession();
          const accessToken = data.session?.access_token;
          if (accessToken) {
            const headers =
              config.headers instanceof AxiosHeaders
                ? (config.headers as AxiosHeaders)
                : new AxiosHeaders(config.headers);
            headers.set("Authorization", `Bearer ${accessToken}`);
            config.headers = headers;
          }
        } catch (e) {
          console.error("Failed to attach auth token", e);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        console.error("API Error:", error.message, error.response?.status);

        if (error.response?.status === 401) {
          // Handle unauthorized - clear token
          store.dispatch(setAuthError("Session expired. Please login again."));
        }

        const apiError: ApiError = {
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred",
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic API methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async getWeatherByCoordinates(lat: number, lng: number) {
    return this.post("/weather", { lat, lng });
  }

  async getWeatherByCity(city: string) {
    return this.get(`/weather/city?city=${encodeURIComponent(city)}`);
  }

  // Places specific methods
  async getPlacesByCategory(category: string) {
    return this.get(`/places/category/${category}`);
  }

  async getPlaceDetails(placeId: string) {
    return this.get(`/places/${placeId}`);
  }

  async getNearbyPlaces(lat: number, lng: number, radius?: number) {
    return this.get(
      `/places/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`
    );
  }

  // Search locations using Weather API
  async searchLocations(query: string, countryCode?: string) {
    const searchQuery = countryCode ? `${query} ${countryCode}` : query;
    return this.get(`/weather/search?q=${encodeURIComponent(searchQuery)}`);
  }

  // Geo data methods using Goveling API
  async getCountries() {
    try {
      console.log("Fetching countries from Goveling API...");
      const response = await axios.get(
        "https://goveling-api.onrender.com/geo/countries"
      );
      console.log("Countries API response:", response.data);

      const countries = response.data;

      if (Array.isArray(countries)) {
        return countries.map((country: any) => ({
          country_code: country.country_code,
          country_name: country.country_name,
          phone_code: country.phone_code?.startsWith("+")
            ? country.phone_code
            : `+${country.phone_code}`,
        }));
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error fetching countries from Goveling API:", error);
      console.log("Using fallback countries data...");

      // Fallback to comprehensive static list
      return [
        { country_code: "AD", country_name: "Andorra", phone_code: "+376" },
        {
          country_code: "AE",
          country_name: "United Arab Emirates",
          phone_code: "+971",
        },
        { country_code: "AF", country_name: "Afghanistan", phone_code: "+93" },
        {
          country_code: "AG",
          country_name: "Antigua and Barbuda",
          phone_code: "+1",
        },
        { country_code: "AI", country_name: "Anguilla", phone_code: "+1" },
        { country_code: "AL", country_name: "Albania", phone_code: "+355" },
        { country_code: "AM", country_name: "Armenia", phone_code: "+374" },
        { country_code: "AO", country_name: "Angola", phone_code: "+244" },
        { country_code: "AR", country_name: "Argentina", phone_code: "+54" },
        {
          country_code: "AS",
          country_name: "American Samoa",
          phone_code: "+1",
        },
        { country_code: "AT", country_name: "Austria", phone_code: "+43" },
        { country_code: "AU", country_name: "Australia", phone_code: "+61" },
        { country_code: "AW", country_name: "Aruba", phone_code: "+297" },
        { country_code: "AZ", country_name: "Azerbaijan", phone_code: "+994" },
        {
          country_code: "BA",
          country_name: "Bosnia and Herzegovina",
          phone_code: "+387",
        },
        { country_code: "BB", country_name: "Barbados", phone_code: "+1" },
        { country_code: "BD", country_name: "Bangladesh", phone_code: "+880" },
        { country_code: "BE", country_name: "Belgium", phone_code: "+32" },
        {
          country_code: "BF",
          country_name: "Burkina Faso",
          phone_code: "+226",
        },
        { country_code: "BG", country_name: "Bulgaria", phone_code: "+359" },
        { country_code: "BH", country_name: "Bahrain", phone_code: "+973" },
        { country_code: "BI", country_name: "Burundi", phone_code: "+257" },
        { country_code: "BJ", country_name: "Benin", phone_code: "+229" },
        { country_code: "BM", country_name: "Bermuda", phone_code: "+1" },
        { country_code: "BN", country_name: "Brunei", phone_code: "+673" },
        { country_code: "BO", country_name: "Bolivia", phone_code: "+591" },
        { country_code: "BR", country_name: "Brazil", phone_code: "+55" },
        { country_code: "BS", country_name: "Bahamas", phone_code: "+1" },
        { country_code: "BT", country_name: "Bhutan", phone_code: "+975" },
        { country_code: "BW", country_name: "Botswana", phone_code: "+267" },
        { country_code: "BY", country_name: "Belarus", phone_code: "+375" },
        { country_code: "BZ", country_name: "Belize", phone_code: "+501" },
        { country_code: "CA", country_name: "Canada", phone_code: "+1" },
        {
          country_code: "CD",
          country_name: "Democratic Republic of the Congo",
          phone_code: "+243",
        },
        {
          country_code: "CF",
          country_name: "Central African Republic",
          phone_code: "+236",
        },
        {
          country_code: "CG",
          country_name: "Republic of the Congo",
          phone_code: "+242",
        },
        { country_code: "CH", country_name: "Switzerland", phone_code: "+41" },
        { country_code: "CI", country_name: "Ivory Coast", phone_code: "+225" },
        {
          country_code: "CK",
          country_name: "Cook Islands",
          phone_code: "+682",
        },
        { country_code: "CL", country_name: "Chile", phone_code: "+56" },
        { country_code: "CM", country_name: "Cameroon", phone_code: "+237" },
        { country_code: "CN", country_name: "China", phone_code: "+86" },
        { country_code: "CO", country_name: "Colombia", phone_code: "+57" },
        { country_code: "CR", country_name: "Costa Rica", phone_code: "+506" },
        { country_code: "CU", country_name: "Cuba", phone_code: "+53" },
        { country_code: "CV", country_name: "Cape Verde", phone_code: "+238" },
        { country_code: "CY", country_name: "Cyprus", phone_code: "+357" },
        {
          country_code: "CZ",
          country_name: "Czech Republic",
          phone_code: "+420",
        },
        { country_code: "DE", country_name: "Germany", phone_code: "+49" },
        { country_code: "DJ", country_name: "Djibouti", phone_code: "+253" },
        { country_code: "DK", country_name: "Denmark", phone_code: "+45" },
        { country_code: "DM", country_name: "Dominica", phone_code: "+1" },
        {
          country_code: "DO",
          country_name: "Dominican Republic",
          phone_code: "+1",
        },
        { country_code: "DZ", country_name: "Algeria", phone_code: "+213" },
        { country_code: "EC", country_name: "Ecuador", phone_code: "+593" },
        { country_code: "EE", country_name: "Estonia", phone_code: "+372" },
        { country_code: "EG", country_name: "Egypt", phone_code: "+20" },
        { country_code: "ER", country_name: "Eritrea", phone_code: "+291" },
        { country_code: "ES", country_name: "Spain", phone_code: "+34" },
        { country_code: "ET", country_name: "Ethiopia", phone_code: "+251" },
        { country_code: "FI", country_name: "Finland", phone_code: "+358" },
        { country_code: "FJ", country_name: "Fiji", phone_code: "+679" },
        {
          country_code: "FK",
          country_name: "Falkland Islands",
          phone_code: "+500",
        },
        { country_code: "FM", country_name: "Micronesia", phone_code: "+691" },
        {
          country_code: "FO",
          country_name: "Faroe Islands",
          phone_code: "+298",
        },
        { country_code: "FR", country_name: "France", phone_code: "+33" },
        { country_code: "GA", country_name: "Gabon", phone_code: "+241" },
        {
          country_code: "GB",
          country_name: "United Kingdom",
          phone_code: "+44",
        },
        { country_code: "GD", country_name: "Grenada", phone_code: "+1" },
        { country_code: "GE", country_name: "Georgia", phone_code: "+995" },
        { country_code: "GH", country_name: "Ghana", phone_code: "+233" },
        { country_code: "GI", country_name: "Gibraltar", phone_code: "+350" },
        { country_code: "GL", country_name: "Greenland", phone_code: "+299" },
        { country_code: "GM", country_name: "Gambia", phone_code: "+220" },
        { country_code: "GN", country_name: "Guinea", phone_code: "+224" },
        {
          country_code: "GQ",
          country_name: "Equatorial Guinea",
          phone_code: "+240",
        },
        { country_code: "GR", country_name: "Greece", phone_code: "+30" },
        { country_code: "GT", country_name: "Guatemala", phone_code: "+502" },
        { country_code: "GU", country_name: "Guam", phone_code: "+1" },
        {
          country_code: "GW",
          country_name: "Guinea-Bissau",
          phone_code: "+245",
        },
        { country_code: "GY", country_name: "Guyana", phone_code: "+592" },
        { country_code: "HK", country_name: "Hong Kong", phone_code: "+852" },
        { country_code: "HN", country_name: "Honduras", phone_code: "+504" },
        { country_code: "HR", country_name: "Croatia", phone_code: "+385" },
        { country_code: "HT", country_name: "Haiti", phone_code: "+509" },
        { country_code: "HU", country_name: "Hungary", phone_code: "+36" },
        { country_code: "ID", country_name: "Indonesia", phone_code: "+62" },
        { country_code: "IE", country_name: "Ireland", phone_code: "+353" },
        { country_code: "IL", country_name: "Israel", phone_code: "+972" },
        { country_code: "IM", country_name: "Isle of Man", phone_code: "+44" },
        { country_code: "IN", country_name: "India", phone_code: "+91" },
        { country_code: "IQ", country_name: "Iraq", phone_code: "+964" },
        { country_code: "IR", country_name: "Iran", phone_code: "+98" },
        { country_code: "IS", country_name: "Iceland", phone_code: "+354" },
        { country_code: "IT", country_name: "Italy", phone_code: "+39" },
        { country_code: "JE", country_name: "Jersey", phone_code: "+44" },
        { country_code: "JM", country_name: "Jamaica", phone_code: "+1" },
        { country_code: "JO", country_name: "Jordan", phone_code: "+962" },
        { country_code: "JP", country_name: "Japan", phone_code: "+81" },
        { country_code: "KE", country_name: "Kenya", phone_code: "+254" },
        { country_code: "KG", country_name: "Kyrgyzstan", phone_code: "+996" },
        { country_code: "KH", country_name: "Cambodia", phone_code: "+855" },
        { country_code: "KI", country_name: "Kiribati", phone_code: "+686" },
        { country_code: "KM", country_name: "Comoros", phone_code: "+269" },
        {
          country_code: "KN",
          country_name: "Saint Kitts and Nevis",
          phone_code: "+1",
        },
        { country_code: "KP", country_name: "North Korea", phone_code: "+850" },
        { country_code: "KR", country_name: "South Korea", phone_code: "+82" },
        { country_code: "KW", country_name: "Kuwait", phone_code: "+965" },
        {
          country_code: "KY",
          country_name: "Cayman Islands",
          phone_code: "+1",
        },
        { country_code: "KZ", country_name: "Kazakhstan", phone_code: "+7" },
        { country_code: "LA", country_name: "Laos", phone_code: "+856" },
        { country_code: "LB", country_name: "Lebanon", phone_code: "+961" },
        { country_code: "LC", country_name: "Saint Lucia", phone_code: "+1" },
        {
          country_code: "LI",
          country_name: "Liechtenstein",
          phone_code: "+423",
        },
        { country_code: "LK", country_name: "Sri Lanka", phone_code: "+94" },
        { country_code: "LR", country_name: "Liberia", phone_code: "+231" },
        { country_code: "LS", country_name: "Lesotho", phone_code: "+266" },
        { country_code: "LT", country_name: "Lithuania", phone_code: "+370" },
        { country_code: "LU", country_name: "Luxembourg", phone_code: "+352" },
        { country_code: "LV", country_name: "Latvia", phone_code: "+371" },
        { country_code: "LY", country_name: "Libya", phone_code: "+218" },
        { country_code: "MA", country_name: "Morocco", phone_code: "+212" },
        { country_code: "MC", country_name: "Monaco", phone_code: "+377" },
        { country_code: "MD", country_name: "Moldova", phone_code: "+373" },
        { country_code: "ME", country_name: "Montenegro", phone_code: "+382" },
        { country_code: "MG", country_name: "Madagascar", phone_code: "+261" },
        {
          country_code: "MH",
          country_name: "Marshall Islands",
          phone_code: "+692",
        },
        {
          country_code: "MK",
          country_name: "North Macedonia",
          phone_code: "+389",
        },
        { country_code: "ML", country_name: "Mali", phone_code: "+223" },
        { country_code: "MM", country_name: "Myanmar", phone_code: "+95" },
        { country_code: "MN", country_name: "Mongolia", phone_code: "+976" },
        { country_code: "MO", country_name: "Macau", phone_code: "+853" },
        { country_code: "MR", country_name: "Mauritania", phone_code: "+222" },
        { country_code: "MS", country_name: "Montserrat", phone_code: "+1" },
        { country_code: "MT", country_name: "Malta", phone_code: "+356" },
        { country_code: "MU", country_name: "Mauritius", phone_code: "+230" },
        { country_code: "MV", country_name: "Maldives", phone_code: "+960" },
        { country_code: "MW", country_name: "Malawi", phone_code: "+265" },
        { country_code: "MX", country_name: "Mexico", phone_code: "+52" },
        { country_code: "MY", country_name: "Malaysia", phone_code: "+60" },
        { country_code: "MZ", country_name: "Mozambique", phone_code: "+258" },
        { country_code: "NA", country_name: "Namibia", phone_code: "+264" },
        {
          country_code: "NC",
          country_name: "New Caledonia",
          phone_code: "+687",
        },
        { country_code: "NE", country_name: "Niger", phone_code: "+227" },
        { country_code: "NG", country_name: "Nigeria", phone_code: "+234" },
        { country_code: "NI", country_name: "Nicaragua", phone_code: "+505" },
        { country_code: "NL", country_name: "Netherlands", phone_code: "+31" },
        { country_code: "NO", country_name: "Norway", phone_code: "+47" },
        { country_code: "NP", country_name: "Nepal", phone_code: "+977" },
        { country_code: "NR", country_name: "Nauru", phone_code: "+674" },
        { country_code: "NU", country_name: "Niue", phone_code: "+683" },
        { country_code: "NZ", country_name: "New Zealand", phone_code: "+64" },
        { country_code: "OM", country_name: "Oman", phone_code: "+968" },
        { country_code: "PA", country_name: "Panama", phone_code: "+507" },
        { country_code: "PE", country_name: "Peru", phone_code: "+51" },
        {
          country_code: "PF",
          country_name: "French Polynesia",
          phone_code: "+689",
        },
        {
          country_code: "PG",
          country_name: "Papua New Guinea",
          phone_code: "+675",
        },
        { country_code: "PH", country_name: "Philippines", phone_code: "+63" },
        { country_code: "PK", country_name: "Pakistan", phone_code: "+92" },
        { country_code: "PL", country_name: "Poland", phone_code: "+48" },
        {
          country_code: "PM",
          country_name: "Saint Pierre and Miquelon",
          phone_code: "+508",
        },
        {
          country_code: "PN",
          country_name: "Pitcairn Islands",
          phone_code: "+64",
        },
        { country_code: "PR", country_name: "Puerto Rico", phone_code: "+1" },
        { country_code: "PS", country_name: "Palestine", phone_code: "+970" },
        { country_code: "PT", country_name: "Portugal", phone_code: "+351" },
        { country_code: "PW", country_name: "Palau", phone_code: "+680" },
        { country_code: "PY", country_name: "Paraguay", phone_code: "+595" },
        { country_code: "QA", country_name: "Qatar", phone_code: "+974" },
        { country_code: "RO", country_name: "Romania", phone_code: "+40" },
        { country_code: "RS", country_name: "Serbia", phone_code: "+381" },
        { country_code: "RU", country_name: "Russia", phone_code: "+7" },
        { country_code: "RW", country_name: "Rwanda", phone_code: "+250" },
        {
          country_code: "SA",
          country_name: "Saudi Arabia",
          phone_code: "+966",
        },
        {
          country_code: "SB",
          country_name: "Solomon Islands",
          phone_code: "+677",
        },
        { country_code: "SC", country_name: "Seychelles", phone_code: "+248" },
        { country_code: "SD", country_name: "Sudan", phone_code: "+249" },
        { country_code: "SE", country_name: "Sweden", phone_code: "+46" },
        { country_code: "SG", country_name: "Singapore", phone_code: "+65" },
        {
          country_code: "SH",
          country_name: "Saint Helena",
          phone_code: "+290",
        },
        { country_code: "SI", country_name: "Slovenia", phone_code: "+386" },
        { country_code: "SK", country_name: "Slovakia", phone_code: "+421" },
        {
          country_code: "SL",
          country_name: "Sierra Leone",
          phone_code: "+232",
        },
        { country_code: "SM", country_name: "San Marino", phone_code: "+378" },
        { country_code: "SN", country_name: "Senegal", phone_code: "+221" },
        { country_code: "SO", country_name: "Somalia", phone_code: "+252" },
        { country_code: "SR", country_name: "Suriname", phone_code: "+597" },
        { country_code: "SS", country_name: "South Sudan", phone_code: "+211" },
        {
          country_code: "ST",
          country_name: "São Tomé and Príncipe",
          phone_code: "+239",
        },
        { country_code: "SV", country_name: "El Salvador", phone_code: "+503" },
        { country_code: "SX", country_name: "Sint Maarten", phone_code: "+1" },
        { country_code: "SY", country_name: "Syria", phone_code: "+963" },
        { country_code: "SZ", country_name: "Eswatini", phone_code: "+268" },
        {
          country_code: "TC",
          country_name: "Turks and Caicos Islands",
          phone_code: "+1",
        },
        { country_code: "TD", country_name: "Chad", phone_code: "+235" },
        { country_code: "TG", country_name: "Togo", phone_code: "+228" },
        { country_code: "TH", country_name: "Thailand", phone_code: "+66" },
        { country_code: "TJ", country_name: "Tajikistan", phone_code: "+992" },
        { country_code: "TK", country_name: "Tokelau", phone_code: "+690" },
        { country_code: "TL", country_name: "East Timor", phone_code: "+670" },
        {
          country_code: "TM",
          country_name: "Turkmenistan",
          phone_code: "+993",
        },
        { country_code: "TN", country_name: "Tunisia", phone_code: "+216" },
        { country_code: "TO", country_name: "Tonga", phone_code: "+676" },
        { country_code: "TR", country_name: "Turkey", phone_code: "+90" },
        {
          country_code: "TT",
          country_name: "Trinidad and Tobago",
          phone_code: "+1",
        },
        { country_code: "TV", country_name: "Tuvalu", phone_code: "+688" },
        { country_code: "TW", country_name: "Taiwan", phone_code: "+886" },
        { country_code: "TZ", country_name: "Tanzania", phone_code: "+255" },
        { country_code: "UA", country_name: "Ukraine", phone_code: "+380" },
        { country_code: "UG", country_name: "Uganda", phone_code: "+256" },
        { country_code: "US", country_name: "United States", phone_code: "+1" },
        { country_code: "UY", country_name: "Uruguay", phone_code: "+598" },
        { country_code: "UZ", country_name: "Uzbekistan", phone_code: "+998" },
        {
          country_code: "VA",
          country_name: "Vatican City",
          phone_code: "+379",
        },
        {
          country_code: "VC",
          country_name: "Saint Vincent and the Grenadines",
          phone_code: "+1",
        },
        { country_code: "VE", country_name: "Venezuela", phone_code: "+58" },
        {
          country_code: "VG",
          country_name: "British Virgin Islands",
          phone_code: "+1",
        },
        {
          country_code: "VI",
          country_name: "U.S. Virgin Islands",
          phone_code: "+1",
        },
        { country_code: "VN", country_name: "Vietnam", phone_code: "+84" },
        { country_code: "VU", country_name: "Vanuatu", phone_code: "+678" },
        {
          country_code: "WF",
          country_name: "Wallis and Futuna",
          phone_code: "+681",
        },
        { country_code: "WS", country_name: "Samoa", phone_code: "+685" },
        { country_code: "XK", country_name: "Kosovo", phone_code: "+383" },
        { country_code: "YE", country_name: "Yemen", phone_code: "+967" },
        { country_code: "YT", country_name: "Mayotte", phone_code: "+262" },
        { country_code: "ZA", country_name: "South Africa", phone_code: "+27" },
        { country_code: "ZM", country_name: "Zambia", phone_code: "+260" },
        { country_code: "ZW", country_name: "Zimbabwe", phone_code: "+263" },
      ];
    }
  }

  async getCitiesByCountry(countryCode: string) {
    if (!countryCode) {
      return [];
    }

    try {
      console.log(
        "Fetching cities for country from Goveling API:",
        countryCode
      );

      // Try the correct Goveling API endpoint format
      const response = await axios.get(
        `https://goveling-api.onrender.com/geo/countries/${countryCode}/cities`
      );
      console.log("Cities API response:", response.data);

      const cities = response.data;

      if (Array.isArray(cities)) {
        return cities.map((city: any) => ({
          city: city.city || city.name,
          latitude: city.latitude || city.lat || 0,
          longitude: city.longitude || city.lng || city.lon || 0,
          population: city.population || 0,
          country_code: countryCode.toUpperCase(),
        }));
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Goveling API failed, using fallback data:", error);

      // Extensive fallback data for major countries
      const staticCities: Record<string, any[]> = {
        US: [
          {
            city: "New York",
            latitude: 40.7128,
            longitude: -74.006,
            population: 8000000,
            country_code: "US",
          },
          {
            city: "Los Angeles",
            latitude: 34.0522,
            longitude: -118.2437,
            population: 4000000,
            country_code: "US",
          },
          {
            city: "Chicago",
            latitude: 41.8781,
            longitude: -87.6298,
            population: 2700000,
            country_code: "US",
          },
          {
            city: "Houston",
            latitude: 29.7604,
            longitude: -95.3698,
            population: 2300000,
            country_code: "US",
          },
          {
            city: "Phoenix",
            latitude: 33.4484,
            longitude: -112.074,
            population: 1700000,
            country_code: "US",
          },
          {
            city: "Philadelphia",
            latitude: 39.9526,
            longitude: -75.1652,
            population: 1600000,
            country_code: "US",
          },
          {
            city: "San Antonio",
            latitude: 29.4241,
            longitude: -98.4936,
            population: 1500000,
            country_code: "US",
          },
          {
            city: "San Diego",
            latitude: 32.7157,
            longitude: -117.1611,
            population: 1400000,
            country_code: "US",
          },
          {
            city: "Dallas",
            latitude: 32.7767,
            longitude: -96.797,
            population: 1300000,
            country_code: "US",
          },
          {
            city: "San Jose",
            latitude: 37.3382,
            longitude: -121.8863,
            population: 1000000,
            country_code: "US",
          },
        ],
        ES: [
          {
            city: "Madrid",
            latitude: 40.4168,
            longitude: -3.7038,
            population: 3200000,
            country_code: "ES",
          },
          {
            city: "Barcelona",
            latitude: 41.3851,
            longitude: 2.1734,
            population: 1600000,
            country_code: "ES",
          },
          {
            city: "Valencia",
            latitude: 39.4699,
            longitude: -0.3763,
            population: 800000,
            country_code: "ES",
          },
          {
            city: "Sevilla",
            latitude: 37.3891,
            longitude: -5.9845,
            population: 700000,
            country_code: "ES",
          },
          {
            city: "Zaragoza",
            latitude: 41.6488,
            longitude: -0.8891,
            population: 670000,
            country_code: "ES",
          },
          {
            city: "Málaga",
            latitude: 36.7213,
            longitude: -4.4214,
            population: 570000,
            country_code: "ES",
          },
          {
            city: "Murcia",
            latitude: 37.9923,
            longitude: -1.1307,
            population: 450000,
            country_code: "ES",
          },
          {
            city: "Palma",
            latitude: 39.5696,
            longitude: 2.6502,
            population: 410000,
            country_code: "ES",
          },
          {
            city: "Las Palmas",
            latitude: 28.1248,
            longitude: -15.43,
            population: 380000,
            country_code: "ES",
          },
          {
            city: "Bilbao",
            latitude: 43.263,
            longitude: -2.935,
            population: 350000,
            country_code: "ES",
          },
        ],
        CL: [
          {
            city: "Santiago",
            latitude: -33.4489,
            longitude: -70.6693,
            population: 6000000,
            country_code: "CL",
          },
          {
            city: "Valparaíso",
            latitude: -33.0472,
            longitude: -71.6127,
            population: 300000,
            country_code: "CL",
          },
          {
            city: "Concepción",
            latitude: -36.8201,
            longitude: -73.0444,
            population: 230000,
            country_code: "CL",
          },
          {
            city: "La Serena",
            latitude: -29.9027,
            longitude: -71.2519,
            population: 200000,
            country_code: "CL",
          },
          {
            city: "Antofagasta",
            latitude: -23.6509,
            longitude: -70.3975,
            population: 361873,
            country_code: "CL",
          },
          {
            city: "Temuco",
            latitude: -38.7359,
            longitude: -72.5904,
            population: 280000,
            country_code: "CL",
          },
          {
            city: "Rancagua",
            latitude: -34.1708,
            longitude: -70.7394,
            population: 240000,
            country_code: "CL",
          },
          {
            city: "Arica",
            latitude: -18.4783,
            longitude: -70.3126,
            population: 190000,
            country_code: "CL",
          },
          {
            city: "Talca",
            latitude: -35.4264,
            longitude: -71.6554,
            population: 220000,
            country_code: "CL",
          },
          {
            city: "Chillán",
            latitude: -36.6063,
            longitude: -72.1033,
            population: 180000,
            country_code: "CL",
          },
        ],
        MX: [
          {
            city: "Mexico City",
            latitude: 19.4326,
            longitude: -99.1332,
            population: 9000000,
            country_code: "MX",
          },
          {
            city: "Guadalajara",
            latitude: 20.6597,
            longitude: -103.3496,
            population: 1500000,
            country_code: "MX",
          },
          {
            city: "Monterrey",
            latitude: 25.6866,
            longitude: -100.3161,
            population: 1100000,
            country_code: "MX",
          },
          {
            city: "Puebla",
            latitude: 19.0414,
            longitude: -98.2063,
            population: 1500000,
            country_code: "MX",
          },
          {
            city: "Tijuana",
            latitude: 32.5149,
            longitude: -117.0382,
            population: 1640000,
            country_code: "MX",
          },
          {
            city: "León",
            latitude: 21.1619,
            longitude: -101.6921,
            population: 1500000,
            country_code: "MX",
          },
          {
            city: "Juárez",
            latitude: 31.6904,
            longitude: -106.4245,
            population: 1400000,
            country_code: "MX",
          },
          {
            city: "Torreón",
            latitude: 25.5428,
            longitude: -103.4068,
            population: 690000,
            country_code: "MX",
          },
          {
            city: "Querétaro",
            latitude: 20.5888,
            longitude: -100.3899,
            population: 880000,
            country_code: "MX",
          },
          {
            city: "Cancún",
            latitude: 21.1619,
            longitude: -86.8515,
            population: 700000,
            country_code: "MX",
          },
        ],
        FR: [
          {
            city: "Paris",
            latitude: 48.8566,
            longitude: 2.3522,
            population: 2200000,
            country_code: "FR",
          },
          {
            city: "Marseille",
            latitude: 43.2965,
            longitude: 5.3698,
            population: 860000,
            country_code: "FR",
          },
          {
            city: "Lyon",
            latitude: 45.764,
            longitude: 4.8357,
            population: 500000,
            country_code: "FR",
          },
          {
            city: "Toulouse",
            latitude: 43.6047,
            longitude: 1.4442,
            population: 470000,
            country_code: "FR",
          },
          {
            city: "Nice",
            latitude: 43.7102,
            longitude: 7.262,
            population: 340000,
            country_code: "FR",
          },
          {
            city: "Nantes",
            latitude: 47.2184,
            longitude: -1.5536,
            population: 310000,
            country_code: "FR",
          },
          {
            city: "Strasbourg",
            latitude: 48.5734,
            longitude: 7.7521,
            population: 280000,
            country_code: "FR",
          },
          {
            city: "Montpellier",
            latitude: 43.611,
            longitude: 3.8767,
            population: 280000,
            country_code: "FR",
          },
          {
            city: "Bordeaux",
            latitude: 44.8378,
            longitude: -0.5792,
            population: 250000,
            country_code: "FR",
          },
          {
            city: "Lille",
            latitude: 50.6292,
            longitude: 3.0573,
            population: 230000,
            country_code: "FR",
          },
        ],
        AR: [
          {
            city: "Buenos Aires",
            latitude: -34.6118,
            longitude: -58.396,
            population: 3000000,
            country_code: "AR",
          },
          {
            city: "Córdoba",
            latitude: -31.4201,
            longitude: -64.1888,
            population: 1500000,
            country_code: "AR",
          },
          {
            city: "Rosario",
            latitude: -32.9442,
            longitude: -60.6505,
            population: 1200000,
            country_code: "AR",
          },
          {
            city: "Mendoza",
            latitude: -32.8833,
            longitude: -68.8167,
            population: 900000,
            country_code: "AR",
          },
          {
            city: "Tucumán",
            latitude: -26.8241,
            longitude: -65.2226,
            population: 800000,
            country_code: "AR",
          },
          {
            city: "La Plata",
            latitude: -34.9215,
            longitude: -57.9545,
            population: 700000,
            country_code: "AR",
          },
          {
            city: "Mar del Plata",
            latitude: -38.0055,
            longitude: -57.5426,
            population: 600000,
            country_code: "AR",
          },
          {
            city: "Salta",
            latitude: -24.7821,
            longitude: -65.4232,
            population: 500000,
            country_code: "AR",
          },
          {
            city: "Santa Fe",
            latitude: -31.6333,
            longitude: -60.7,
            population: 400000,
            country_code: "AR",
          },
          {
            city: "San Juan",
            latitude: -31.5375,
            longitude: -68.5364,
            population: 450000,
            country_code: "AR",
          },
        ],
      };

      return staticCities[countryCode.toUpperCase()] || [];
    }
  }

  // User specific methods
  async getUserProfile(userId: string) {
    return this.get(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.put(`/users/${userId}`, data);
  }
}

export const apiService = new ApiService();
export default apiService;
