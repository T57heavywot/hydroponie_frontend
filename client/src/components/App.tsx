import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  ph: number;
  ec: number;
}

interface WaterLevel {
  level: number;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>({ level: 0 });
  const [selectedHours, setSelectedHours] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simuler la récupération des données du backend
        const mockSensorData = generateMockData(selectedHours);
        setSensorData(mockSensorData);
        // Simuler la récupération du niveau d'eau
        const mockWaterLevel = { level: Math.floor(Math.random() * 100) };
        setWaterLevel(mockWaterLevel);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [selectedHours]);
const generateMockData = (hours: number): SensorData[] => {
    const now = new Date();
    const data: SensorData[] = [];
    for (let i = hours ; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        temperature: 20 + Math.random() * 5, // Entre 20°C et 25°C
        humidity: 40 + Math.random() * 20, // Entre 40% et 60%
        lightLevel: 500 + Math.random() * 300, // Entre 500 et 800 lux
        nutrients: {
          nitrogen: 200 + Math.random() * 100, // PPM
          phosphorus: 50 + Math.random() * 30,
          potassium: 150 + Math.random() * 50
        },
        ph: 5.5 + Math.random() * 2, // Entre 5.5 et 7.5
        ec: 1.2 + Math.random() * 0.6 // Conductivité électrique en mS/cm
      });
    }
    return data;
  };

  const handleHoursChange = (hours: number) => {
    setSelectedHours(hours);
  };

  // Préparer les données pour les graphiques
  const getChartData = (dataKey: keyof SensorData, label: string, color: string) => {
    if (!sensorData.length) return null;

    const labels = sensorData.map(data => {
      const date = new Date(data.timestamp);
      return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    });

    return {
      labels,
      datasets: [
        {
          label,
          data: sensorData.map(data => {
            // @ts-ignore
            return typeof data[dataKey] === 'object' ? null : data[dataKey];
          }),
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };
// Options communes pour les graphiques
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Préparer les données pour le graphique de nutriments
  const getNutrientsChartData = () => {
    if (!sensorData.length) return null;

    const labels = sensorData.map(data => {
      const date = new Date(data.timestamp);
      return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    });

    return {
      labels,
      datasets: [
        {
          label: 'Azote (N)',
          data: sensorData.map(data => data.nutrients.nitrogen),
          borderColor: '#4ade80',
          backgroundColor: '#4ade8020',
          tension: 0.4,
        },
        {
          label: 'Phosphore (P)',
          data: sensorData.map(data => data.nutrients.phosphorus),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          tension: 0.4,
        },
        {
          label: 'Potassium (K)',
          data: sensorData.map(data => data.nutrients.potassium),
          borderColor: '#a855f7',
          backgroundColor: '#a855f720',
          tension: 0.4,
        },
      ],
    };
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 shadow-md">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-white">
            Hydroponie - Tableau de Bord
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6">
        {/* Time Range Selector */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Sélectionner une plage horaire</h2>
          <div className="flex flex-wrap gap-2">
            {[3, 6, 12, 24].map((hours) => (
              <button
                key={hours}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedHours === hours
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleHoursChange(hours)}
              >
                {hours} heures
              </button>
            ))}
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique d'humidité */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution de l'humidité</h2>
            {getChartData('humidity', 'Humidité (%)', '#3b82f6') && (
              <Line
                data={getChartData('humidity', 'Humidité (%)', '#3b82f6')!}
                options={chartOptions}
              />
            )}
          </div>

          {/* Graphique de luminosité */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution de la luminosité</h2>
            {getChartData('lightLevel', 'Luminosité (lux)', '#eab308') && (
              <Line
                data={getChartData('lightLevel', 'Luminosité (lux)', '#eab308')!}
                options={chartOptions}
              />
            )}
          </div>

          {/* Graphique de pH */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution du pH</h2>
            {getChartData('ph', 'pH', '#a855f7') && (
              <Line
                data={getChartData('ph', 'pH', '#a855f7')!}
                options={chartOptions}
              />
            )}
          </div>

          {/* Graphique des nutriments */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution des nutriments</h2>
            {getNutrientsChartData() && (
              <Line
                data={getNutrientsChartData()!}
                options={chartOptions}
              />
            )}
          </div>

          {/* Niveau d'eau */}
          <div className="bg-white rounded-md shadow p-3">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Niveau d'eau</h2>
            <div className="relative h-48 bg-gray-200 rounded-md overflow-hidden">
              <div
                className={`absolute bottom-0 w-full transition-all duration-500 ${
                  waterLevel.level < 20
                    ? 'bg-red-500'
                    : waterLevel.level < 40
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
                }`}
                style={{ height: `${waterLevel.level}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-2xl text-white drop-shadow-md">
                  {waterLevel.level}%
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">Critique</span>
              <div className="w-full h-2 bg-gray-300 rounded-full mx-2 relative">
                <div
                  className={`absolute h-2 rounded-full ${
                    waterLevel.level < 20
                      ? 'bg-red-500'
                      : waterLevel.level < 40
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${waterLevel.level}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">Plein</span>
            </div>
            {waterLevel.level < 20 && (
              <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
                Niveau critique! Remplissez le réservoir dès que possible.
              </div>
            )}
            {waterLevel.level >= 20 && waterLevel.level < 40 && (
              <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                Niveau bas. Pensez à remplir le réservoir prochainement.
              </div>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Note pour l'implémentation
          </h3>
          <div className="text-sm text-yellow-700">
            <p>
              On utilise actuellement des données simulées. Pour
              connecter vos capteurs réels, on doit:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Modifier le backend (server.js) pour recevoir les données des
                capteurs physiques
              </li>
              <li>
                Adapter le format des données selon nos capteurs spécifiques
              </li>
              <li>
                Ajuster les plages de valeurs et les unités si besoin, à voir
              </li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Projet Hydroponie</p>
        </div>
      </footer>
    </div>
  );
}

export default App;