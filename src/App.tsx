import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { Thermometer, Wind, Droplets, Eye, AlertTriangle, Leaf, MapPin, Clock, TrendingUp, Info, LucideIcon } from 'lucide-react';

// Type definitions
interface AirQualityStation {
  station: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  aqi: number;
}

interface WeatherDataPoint {
  hour: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

interface HistoricalDataPoint {
  date: string;
  aqi: number;
  temperature: number;
  pm25: number;
}

interface AQIGaugeProps {
  value: number;
  label: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  trend?: number;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

interface AlertBannerProps {
  alerts: string[];
}

// Mock data generators for demonstration
const generateAirQualityData = (): AirQualityStation[] => {
  const stations = ['Calea Plevnei', 'Drumul Taberei', 'Berceni', 'Titan', 'Ambasada'];
  return stations.map(station => ({
    station,
    pm25: Math.floor(Math.random() * 50) + 10,
    pm10: Math.floor(Math.random() * 80) + 20,
    no2: Math.floor(Math.random() * 60) + 15,
    o3: Math.floor(Math.random() * 120) + 30,
    so2: Math.floor(Math.random() * 30) + 5,
    aqi: Math.floor(Math.random() * 150) + 25
  }));
};

const generateWeatherData = (): WeatherDataPoint[] => {
  const hours = Array.from({length: 24}, (_, i) => i);
  return hours.map(hour => ({
    hour: `${hour}:00`,
    temperature: 18 + Math.sin((hour - 6) * Math.PI / 12) * 8 + Math.random() * 2,
    humidity: 45 + Math.random() * 30,
    windSpeed: 5 + Math.random() * 10,
    pressure: 1010 + Math.random() * 20
  }));
};

const generateHistoricalData = (): HistoricalDataPoint[] => {
  const days = Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });
  
  return days.map(date => ({
    date: date.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' }),
    aqi: 50 + Math.sin(date.getTime() / (1000 * 60 * 60 * 24 * 7)) * 30 + Math.random() * 20,
    temperature: 15 + Math.sin(date.getTime() / (1000 * 60 * 60 * 24 * 365)) * 10 + Math.random() * 5,
    pm25: 20 + Math.sin(date.getTime() / (1000 * 60 * 60 * 24 * 14)) * 15 + Math.random() * 10
  }));
};

const AQIGauge: React.FC<AQIGaugeProps> = ({ value, label }) => {
  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#4ade80';
    if (aqi <= 100) return '#facc15';
    if (aqi <= 150) return '#fb923c';
    if (aqi <= 200) return '#ef4444';
    return '#991b1b';
  };

  const getAQILevel = (aqi: number): string => {
    if (aqi <= 50) return 'Bună';
    if (aqi <= 100) return 'Moderată';
    if (aqi <= 150) return 'Nesănătoasă pentru grupuri sensibile';
    if (aqi <= 200) return 'Nesănătoasă';
    return 'Foarte nesănătoasă';
  };

  const data = [{ value: Math.min(value, 300), fill: getAQIColor(value) }];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data}>
          <RadialBar dataKey="value" fill={getAQIColor(value)} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <div className="text-3xl font-bold" style={{ color: getAQIColor(value) }}>
          {Math.round(value)}
        </div>
        <div className="text-sm text-gray-600 mt-1">{getAQILevel(value)}</div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, unit, trend, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={24} />
        {trend && (
          <div className={`flex items-center text-xs ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}{unit}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
};

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
        <div>
          <h4 className="text-amber-800 font-medium">Alertă calitate aer</h4>
          <div className="text-amber-700 text-sm mt-1">
            {alerts.map((alert: string, i: number) => (
              <div key={i}>{alert}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BucharestDashboard() {
  const [airQualityData, setAirQualityData] = useState<AirQualityStation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherDataPoint[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('Toate stațiile');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAirQualityData(generateAirQualityData());
      setWeatherData(generateWeatherData());
      setHistoricalData(generateHistoricalData());
      setIsLoading(false);
    };

    loadData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      setAirQualityData(generateAirQualityData());
      setWeatherData(generateWeatherData());
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const averageAQI = airQualityData.length > 0 
    ? airQualityData.reduce((sum, station) => sum + station.aqi, 0) / airQualityData.length 
    : 0;

  const currentWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : {
    temperature: 20,
    humidity: 65,
    windSpeed: 8,
    pressure: 1015
  };

  const alerts = [];
  if (averageAQI > 100) {
    alerts.push('Calitatea aerului este nesănătoasă pentru grupuri sensibile. Se recomandă limitarea activităților în exterior.');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Încărcare date...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Leaf className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Dashboard Calitatea Vieții București
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin size={16} className="mr-1" />
                  București, România
                  <Clock size={16} className="ml-3 mr-1" />
                  Actualizat: {new Date().toLocaleTimeString('ro-RO')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Toate stațiile</option>
                {airQualityData.map(station => (
                  <option key={station.station} value={station.station}>
                    {station.station}
                  </option>
                ))}
              </select>
              
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Ultimele 24h</option>
                <option value="7d">Ultima săptămână</option>
                <option value="30d">Ultima lună</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AlertBanner alerts={alerts} />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon={Wind} 
            label="Indice Calitate Aer" 
            value={Math.round(averageAQI)}
            unit=""
            trend={-2.3}
            color={averageAQI <= 50 ? 'green' : averageAQI <= 100 ? 'orange' : 'red'}
          />
          <MetricCard 
            icon={Thermometer} 
            label="Temperatura" 
            value={Math.round(currentWeather.temperature || 20)}
            unit="°C"
            trend={1.5}
            color="blue"
          />
          <MetricCard 
            icon={Droplets} 
            label="Umiditate" 
            value={Math.round(currentWeather.humidity || 65)}
            unit="%"
            trend={-0.8}
            color="blue"
          />
          <MetricCard 
            icon={Eye} 
            label="Vizibilitate" 
            value="8.2"
            unit="km"
            trend={0.5}
            color="green"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AQI Gauge */}
          <AQIGauge value={averageAQI} label="Indice General Calitate Aer" />
          
          {/* Real-time Air Quality */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Calitatea Aerului pe Stații
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={airQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="station" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value} μg/m³`, 
                    name === 'pm25' ? 'PM2.5' : 
                    name === 'pm10' ? 'PM10' : 
                    name === 'no2' ? 'NO₂' : String(name).toUpperCase()
                  ]}
                />
                <Legend />
                <Bar dataKey="pm25" fill="#ef4444" name="PM2.5" />
                <Bar dataKey="pm10" fill="#f97316" name="PM10" />
                <Bar dataKey="no2" fill="#eab308" name="NO₂" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Condițiile Meteo (24h)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: any) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value}${
                    name === 'temperature' ? '°C' : 
                    name === 'humidity' ? '%' : 
                    name === 'windSpeed' ? ' km/h' : ''
                  }`, 
                  name === 'temperature' ? 'Temperatură' : 
                  name === 'humidity' ? 'Umiditate' : 
                  name === 'windSpeed' ? 'Viteză vânt' : String(name)
                ]} />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Temperatură"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Umiditate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Tendințe Istorice (30 zile)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any, name: any) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value}${name === 'aqi' ? '' : name === 'temperature' ? '°C' : ' μg/m³'}`, 
                  name === 'aqi' ? 'AQI' : name === 'temperature' ? 'Temperatură' : 'PM2.5'
                ]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stackId="1" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  name="AQI"
                />
                <Area 
                  type="monotone" 
                  dataKey="pm25" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="PM2.5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Info className="mr-2 text-blue-600" />
            Recomandări pentru Sănătate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-l-4 ${
              averageAQI <= 50 ? 'bg-green-50 border-green-400' :
              averageAQI <= 100 ? 'bg-yellow-50 border-yellow-400' : 
              'bg-red-50 border-red-400'
            }`}>
              <h4 className="font-semibold mb-2">Activități în Exterior</h4>
              <p className="text-sm text-gray-700">
                {averageAQI <= 50 
                  ? 'Ideal pentru toate activitățile în exterior. Calitatea aerului este excelentă.'
                  : averageAQI <= 100
                  ? 'Activitățile în exterior sunt acceptabile pentru majoritatea persoanelor.'
                  : 'Se recomandă limitarea activităților intense în exterior, mai ales pentru grupurile sensibile.'
                }
              </p>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Persoane Sensibile</h4>
              <p className="text-sm text-gray-700">
                Copiii, vârstnicii și persoanele cu probleme respiratorii sau cardiovasculare 
                ar trebui să fie precauți când AQI depășește 100.
              </p>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Ventilare Locuință</h4>
              <p className="text-sm text-gray-700">
                {averageAQI <= 75 
                  ? 'Aerisiți regulat locuința pentru a menține aerul proaspăt.'
                  : 'Limitați ventilarea când calitatea exterioară a aerului este scăzută.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Date furnizate de Copernicus Climate Change Service și calitateaer.ro</p>
          <p className="mt-1">Ultima actualizare: {new Date().toLocaleString('ro-RO')}</p>
        </div>
      </div>
    </div>
  );
}