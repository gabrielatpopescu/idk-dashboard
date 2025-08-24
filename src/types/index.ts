export interface Station {
  id: number;
  name: string;
  lat: number;
  lon: number;
  county: string;
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