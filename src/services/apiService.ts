// src/services/apiService.ts
import axios, { AxiosInstance } from 'axios';

// Type definitions
export interface Station {
  id: number;
  name: string;
  lat: number;
  lon: number;
  county: string;
  city?: string;
}

export interface AirQualityMeasurement {
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
}

export interface AirQualityData {
  stationId: number;
  stationName: string;
  timestamp: string;
  measurements: AirQualityMeasurement;
  aqi: number;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
}

export interface HistoricalDataPoint {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature?: number;
}

// Configuration
const API_CONFIG = {
  CALITATE_AER: {
    baseURL: 'https://calitateaer.ro:8443',
    username: process.env.REACT_APP_CALITATE_AER_USERNAME || '',
    password: process.env.REACT_APP_CALITATE_AER_PASSWORD || ''
  },
  COPERNICUS: {
    baseURL: '/api/copernicus', // Your backend proxy endpoint
    apiKey: process.env.REACT_APP_COPERNICUS_API_KEY || ''
  }
};

// Bucharest coordinates and region
const BUCHAREST_COORDS = {
  lat: 44.4268,
  lon: 26.1025,
  north: 44.5,
  south: 44.35,
  east: 26.2,
  west: 26.0
};

export class CalitateAerService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.CALITATE_AER.baseURL,
      timeout: 10000,
      auth: API_CONFIG.CALITATE_AER.username && API_CONFIG.CALITATE_AER.password ? {
        username: API_CONFIG.CALITATE_AER.username,
        password: API_CONFIG.CALITATE_AER.password
      } : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.warn('CalitateAer API Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all monitoring stations in Bucharest area
   */
  async getStations(): Promise<Station[]> {
    try {
      const response = await this.api.get('/stations');
      const stations = response.data;
      
      // Filter for Bucharest stations
      const bucharestStations = stations.filter((station: any) => 
        station.county === 'BUCURESTI' || 
        station.city?.toLowerCase().includes('bucuresti') ||
        station.name?.toLowerCase().includes('bucuresti')
      );

      return bucharestStations.map((station: any) => ({
        id: station.id,
        name: station.name,
        lat: parseFloat(station.latitude),
        lon: parseFloat(station.longitude),
        county: station.county,
        city: station.city
      }));
    } catch (error) {
      console.warn('Using mock stations data due to API error');
      return this.getMockStations();
    }
  }

  /**
   * Get current air quality data for Bucharest stations
   */
  async getCurrentAirQuality(): Promise<AirQualityData[]> {
    try {
      const stations = await this.getStations();
      const stationIds = stations.map((s: Station) => s.id);
      
      const promises = stationIds.map(async (stationId: number) => {
        try {
          const response = await this.api.get(`/measurements/station/${stationId}/current`);
          const data = response.data;
          
          return {
            stationId,
            stationName: stations.find(s => s.id === stationId)?.name || 'Unknown',
            timestamp: new Date().toISOString(),
            measurements: {
              pm25: data.pm25 || 0,
              pm10: data.pm10 || 0,
              no2: data.no2 || 0,
              o3: data.o3 || 0,
              so2: data.so2 || 0,
              co: data.co || 0
            },
            aqi: this.calculateAQI(data)
          };
        } catch (error) {
          console.warn(`Failed to get data for station ${stationId}`);
          return null;
        }
      });

      const results = await Promise.all(promises);
      return results.filter(result => result !== null) as AirQualityData[];
    } catch (error) {
      console.warn('Using mock air quality data due to API error');
      return this.getMockAirQuality();
    }
  }

  /**
   * Get historical air quality data for a station
   */
  async getHistoricalAirQuality(
    stationId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<HistoricalDataPoint[]> {
    try {
      const response = await this.api.get(`/measurements/station/${stationId}/historical`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      return response.data.map((item: any) => ({
        date: item.date,
        aqi: this.calculateAQI(item),
        pm25: item.pm25 || 0,
        pm10: item.pm10 || 0
      }));
    } catch (error) {
      console.warn('Using mock historical data due to API error');
      return this.getMockHistoricalData();
    }
  }

  /**
   * Calculate AQI from pollutant concentrations
   */
  private calculateAQI(measurements: any): number {
    const { pm25, pm10, no2, o3, so2 } = measurements;
    
    // Simplified AQI calculation (you should use the official EPA formula)
    const pm25AQI = pm25 ? Math.min((pm25 / 35.4) * 100, 300) : 0;
    const pm10AQI = pm10 ? Math.min((pm10 / 154) * 100, 300) : 0;
    const no2AQI = no2 ? Math.min((no2 / 100) * 100, 300) : 0;
    
    return Math.round(Math.max(pm25AQI, pm10AQI, no2AQI));
  }

  // Mock data methods
  getMockStations(): Station[] {
    return [
      { id: 1, name: 'Calea Plevnei', lat: 44.4378, lon: 26.0875, county: 'BUCURESTI' },
      { id: 2, name: 'Drumul Taberei', lat: 44.4247, lon: 26.0301, county: 'BUCURESTI' },
      { id: 3, name: 'Berceni', lat: 44.3876, lon: 26.1186, county: 'BUCURESTI' },
      { id: 4, name: 'Titan', lat: 44.4334, lon: 26.1496, county: 'BUCURESTI' },
      { id: 5, name: 'Ambasada', lat: 44.4601, lon: 26.0844, county: 'BUCURESTI' }
    ];
  }

  getMockAirQuality(): AirQualityData[] {
    const stations = this.getMockStations();
    return stations.map(station => ({
      stationId: station.id,
      stationName: station.name,
      timestamp: new Date().toISOString(),
      measurements: {
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 20,
        no2: Math.floor(Math.random() * 60) + 15,
        o3: Math.floor(Math.random() * 120) + 30,
        so2: Math.floor(Math.random() * 30) + 5,
        co: Math.floor(Math.random() * 10) + 2
      },
      aqi: Math.floor(Math.random() * 150) + 25
    }));
  }

  getMockHistoricalData(): HistoricalDataPoint[] {
    const days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        aqi: 50 + Math.sin(i * 0.2) * 30 + Math.random() * 20,
        pm25: 20 + Math.sin(i * 0.3) * 15 + Math.random() * 10,
        pm10: 35 + Math.sin(i * 0.25) * 20 + Math.random() * 15
      };
    });
    return days;
  }
}

export class CopernicusService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.COPERNICUS.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.COPERNICUS.apiKey}`
      }
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.warn('Copernicus API Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get current weather data for Bucharest
   */
  async getCurrentWeather(): Promise<WeatherData> {
    try {
      const response = await this.api.get('/current-weather', {
        params: {
          lat: BUCHAREST_COORDS.lat,
          lon: BUCHAREST_COORDS.lon,
          variables: [
            '2m_temperature', 
            '2m_relative_humidity', 
            '10m_wind_speed', 
            'surface_pressure'
          ]
        }
      });

      const data = response.data;
      return {
        timestamp: new Date().toISOString(),
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        pressure: data.pressure,
        uvIndex: data.uvIndex || Math.random() * 8
      };
    } catch (error) {
      console.warn('Using mock weather data due to API error');
      return this.getMockWeatherData();
    }
  }

  /**
   * Get hourly forecast for next 24 hours
   */
  async getHourlyForecast(): Promise<WeatherData[]> {
    try {
      const response = await this.api.get('/hourly-forecast', {
        params: {
          lat: BUCHAREST_COORDS.lat,
          lon: BUCHAREST_COORDS.lon,
          hours: 24
        }
      });

      return response.data.map((item: any) => ({
        timestamp: item.time,
        temperature: item.temperature,
        humidity: item.humidity,
        windSpeed: item.windSpeed,
        pressure: item.pressure,
        uvIndex: item.uvIndex || 0
      }));
    } catch (error) {
      console.warn('Using mock hourly forecast due to API error');
      return this.getMockHourlyData();
    }
  }

  /**
   * Get historical climate data
   */
  async getHistoricalClimate(startDate: Date, endDate: Date): Promise<HistoricalDataPoint[]> {
    try {
      const response = await this.api.get('/historical-climate', {
        params: {
          lat: BUCHAREST_COORDS.lat,
          lon: BUCHAREST_COORDS.lon,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      return response.data.map((item: any) => ({
        date: item.date,
        aqi: 0, // Not available from weather data
        pm25: 0,
        pm10: 0,
        temperature: item.temperature
      }));
    } catch (error) {
      console.warn('Using mock historical weather due to API error');
      return this.getMockHistoricalWeather();
    }
  }

  // Mock data methods
  getMockWeatherData(): WeatherData {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      timestamp: now.toISOString(),
      temperature: 18 + Math.sin((hour - 6) * Math.PI / 12) * 8 + Math.random() * 2,
      humidity: 45 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      pressure: 1010 + Math.random() * 20,
      uvIndex: Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 8)
    };
  }

  getMockHourlyData(): WeatherData[] {
    const hours = Array.from({length: 24}, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() + i);
      
      return {
        timestamp: time.toISOString(),
        temperature: 18 + Math.sin((i - 6) * Math.PI / 12) * 8 + Math.random() * 2,
        humidity: 45 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 10,
        pressure: 1010 + Math.random() * 20,
        uvIndex: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 8)
      };
    });
    return hours;
  }

  getMockHistoricalWeather(): HistoricalDataPoint[] {
    const days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        aqi: 0,
        pm25: 0,
        pm10: 0,
        temperature: 15 + Math.sin(i * 0.2) * 10 + Math.random() * 5
      };
    });
    return days;
  }
}

// Combined data service
export class DataService {
  private calitateAer: CalitateAerService;
  private copernicus: CopernicusService;

  constructor() {
    this.calitateAer = new CalitateAerService();
    this.copernicus = new CopernicusService();
  }

  async getAllDashboardData() {
    try {
      const [
        airQualityData,
        currentWeather,
        hourlyForecast,
        stations,
        historicalAirQuality
      ] = await Promise.all([
        this.calitateAer.getCurrentAirQuality(),
        this.copernicus.getCurrentWeather(),
        this.copernicus.getHourlyForecast(),
        this.calitateAer.getStations(),
        this.getHistoricalData()
      ]);

      return {
        airQuality: airQualityData,
        weather: {
          current: currentWeather,
          hourly: hourlyForecast
        },
        stations,
        historical: historicalAirQuality,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  private async getHistoricalData(): Promise<HistoricalDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    try {
      // Get historical data from the first available station
      const stations = await this.calitateAer.getStations();
      if (stations.length > 0) {
        return await this.calitateAer.getHistoricalAirQuality(
          stations[0].id,
          startDate,
          endDate
        );
      }
      return this.calitateAer.getMockHistoricalData();
    } catch (error) {
      return this.calitateAer.getMockHistoricalData();
    }
  }

  // Utility methods
  static calculateAverageAQI(airQualityData: AirQualityData[]): number {
    if (airQualityData.length === 0) return 0;
    const sum = airQualityData.reduce((acc, station) => acc + station.aqi, 0);
    return sum / airQualityData.length;
  }

  static getAQILevel(aqi: number): string {
    if (aqi <= 50) return 'Bună';
    if (aqi <= 100) return 'Moderată';
    if (aqi <= 150) return 'Nesănătoasă pentru grupuri sensibile';
    if (aqi <= 200) return 'Nesănătoasă';
    return 'Foarte nesănătoasă';
  }

  static getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#4ade80';
    if (aqi <= 100) return '#facc15';
    if (aqi <= 150) return '#fb923c';
    if (aqi <= 200) return '#ef4444';
    return '#991b1b';
  }
}