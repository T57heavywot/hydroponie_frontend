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
import WaterLevel from './WaterLevel';
import SystemHistoryChart from './SystemHistoryChart';

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
  const [activeTab, setActiveTab] = useState<string>('Graphiques');
  const [selectCharts, setSelectCharts] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

  // Liste des graphiques disponibles
  const chartList = [
    { key: 'oxygen', label: "Oxygène dissous", dataKey: 'humidity', color: '#3b82f6' },
    { key: 'ec', label: "Conductivité", dataKey: 'ec', color: '#a855f7' },
    { key: 'ph', label: "pH", dataKey: 'ph', color: '#a855f7' },
    { key: 'temperature', label: "Température ambiante du réservoir d'eau", dataKey: 'temperature', color: '#3b82f6' },
    { key: 'humidity', label: "Humidité ambiante", dataKey: 'humidity', color: '#a855f7' },
  ];

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
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        lightLevel: 500 + Math.random() * 300,
        nutrients: {
          nitrogen: 200 + Math.random() * 100, // PPM
          phosphorus: 50 + Math.random() * 30,
          potassium: 150 + Math.random() * 50
        },
        ph: 5.5 + Math.random() * 2,
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

  // Gestion de la sélection des graphiques
  const handleChartSelect = (key: string) => {
    setSelectedCharts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Gestion de l’export CSV des graphiques sélectionnés
  const handleExportCSV = () => {
    if (!selectCharts || selectedCharts.length === 0) return;
    // Préparer les entêtes CSV
    let csv = 'Heure';
    chartList.forEach(chart => {
      if (selectedCharts.includes(chart.key)) {
        csv += `;${chart.label}`;
      }
    });
    csv += '\n';
    // Pour chaque point de temps, ajouter les valeurs sélectionnées
    sensorData.forEach((data) => {
      const date = new Date(data.timestamp);
      const hour = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      let row = `${hour}`;
      chartList.forEach(chart => {
        if (selectedCharts.includes(chart.key)) {
          // Récupérer la valeur (attention à dataKey)
          const value = typeof data[chart.dataKey as keyof SensorData] === 'object' ? '' : data[chart.dataKey as keyof SensorData];
          row += `;${value}`;
        }
      });
      csv += row + '\n';
    });
    // Télécharger le CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export_graphiques.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      {/* Onglets wireframe sous le header */}
      <nav className="bg-white border-b border-gray-300">
        <div className="container mx-auto px-6 flex space-x-2">
          {["Graphiques", "Eau", "Nutriments", "Historique"].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 mt-1 border-b-2 font-medium transition-colors duration-150 focus:outline-none ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-700 hover:text-green-600'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main className="container mx-auto py-8 px-6">
        {activeTab === 'Graphiques' ? (
          <div>
            {/* Barre de sélection en haut */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-300">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                {[3, 6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    className={`px-3 py-1 border border-gray-400 rounded bg-gray-100 font-semibold ${selectedHours === hours ? 'bg-green-500 text-white' : ''}`}
                    onClick={() => handleHoursChange(hours)}
                  >
                    {hours} heures
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 text-gray-700">Sélection des graphiques</span>
                <input type="checkbox" className="toggle toggle-sm" checked={selectCharts} onChange={() => setSelectCharts(v => !v)} />
                <button className="ml-4 px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100 disabled:opacity-50" disabled={!selectCharts || selectedCharts.length === 0} onClick={handleExportCSV}>Exporter en CSV</button>
              </div>
            </div>
            {/* Grille des graphiques avec sélection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chartList.map(chart => {
                const chartData = getChartData(chart.dataKey as any, chart.label, chart.color);
                return (
                  <div key={chart.key} className={`bg-white rounded-lg shadow-md p-4 border border-gray-300 relative`}>
                    {selectCharts && (
                      <input
                        type="checkbox"
                        className="absolute top-2 right-2 w-5 h-5"
                        checked={selectedCharts.includes(chart.key)}
                        onChange={() => handleChartSelect(chart.key)}
                      />
                    )}
                    <h2 className="text-base font-semibold text-gray-800 mb-2">Évolution de {chart.label}</h2>
                    {chartData ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <div className="text-gray-400 text-sm">Aucune donnée à afficher</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'Eau' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center border border-gray-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-left w-full">Niveau d'eau du réservoir</h2>
              <WaterLevel level={waterLevel.level} />
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center border border-gray-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-left w-full">Niveau d'eau du bac du système</h2>
              <WaterLevel level={Math.max(0, waterLevel.level - 55)} />
              {waterLevel.level - 55 < 20 && (
                <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
                  Niveau critique! Remplissez le réservoir dès que possible.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'Nutriments' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-400 flex flex-col justify-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Évolution des nutriments</h2>
              {getNutrientsChartData() && (
                <Line
                  data={getNutrientsChartData()!}
                  options={chartOptions}
                />
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Ajout des nutriments</h2>
              <form className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="w-56">Quantité d'azote à ajouter :</label>
                  <input type="text" className="border border-gray-400 rounded px-2 py-1 w-16 text-center font-mono" placeholder="xx" />
                  <button type="button" className="ml-4 px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100">Ajouter</button>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="w-56">Quantité de Phosphore à ajouter :</label>
                  <input type="text" className="border border-gray-400 rounded px-2 py-1 w-16 text-center font-mono" placeholder="yy" />
                  <button type="button" className="ml-4 px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100">Ajouter</button>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="w-56">Quantité de Potassium à ajouter :</label>
                  <input type="text" className="border border-gray-400 rounded px-2 py-1 w-16 text-center font-mono" placeholder="zz" />
                  <button type="button" className="ml-4 px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100">Ajouter</button>
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === 'Historique' ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-400 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Évolution du système dans le temps</h2>
            <div className="absolute right-8 top-8">
              <button className="px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100">Exporter en CSV</button>
            </div>
            <div className="mt-8">
              <SystemHistoryChart sensorData={sensorData} />
            </div>
          </div>
        ) : null}
        {/* Information Box */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400 mt-6">
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