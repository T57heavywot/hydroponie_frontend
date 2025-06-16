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
import annotationPlugin from 'chartjs-plugin-annotation';
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
  Legend,
  annotationPlugin
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
  phReservoir: number;
  phBac: number;
  ecReservoir: number;
  ecBac: number;
  oxygenReservoir: number;
  oxygenBac: number;
}

interface WaterLevel {
  level: number;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>({ level: 0 });
  const [selectedHours, setSelectedHours] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Accueil');
  const [selectCharts, setSelectCharts] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

  // Bornes par défaut (modifiable facilement)
  const BORNES = {
    phReservoir: { min: 5.5, max: 6.5 },
    phBac: { min: 5.5, max: 6.5 },
    ecReservoir: { min: 1.2, max: 2.0 },
    ecBac: { min: 1.2, max: 2.0 },
    oxygenReservoir: { min: 80, max: 100 },
    oxygenBac: { min: 80, max: 100 },
    temperature: { min: 18, max: 26 },
    humidity: { min: 40, max: 70 },
  };

  // Liste des graphiques disponibles
  const chartList = [
    { key: 'oxygenReservoir', label: "Oxygène dissous (réservoir)", dataKey: 'oxygenReservoir', color: '#3b82f6' },
    { key: 'oxygenBac', label: "Oxygène dissous (bac)", dataKey: 'oxygenBac', color: '#2563eb' },
    { key: 'ecReservoir', label: "Conductivité (réservoir)", dataKey: 'ecReservoir', color: '#a855f7' },
    { key: 'ecBac', label: "Conductivité (bac)", dataKey: 'ecBac', color: '#7c3aed' },
    { key: 'phReservoir', label: "pH (réservoir)", dataKey: 'phReservoir', color: '#f472b6' },
    { key: 'phBac', label: "pH (bac)", dataKey: 'phBac', color: '#f59e42' },
    { key: 'temperature', label: "Température ambiante", dataKey: 'temperature', color: '#3b82f6' },
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
        phReservoir: 5.5 + Math.random() * 2,
        phBac: 5.5 + Math.random() * 2,
        ecReservoir: 1.2 + Math.random() * 0.6,
        ecBac: 1.2 + Math.random() * 0.6,
        oxygenReservoir: 80 + Math.random() * 10, // % saturation
        oxygenBac: 80 + Math.random() * 10
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

  // Récupérer la dernière valeur pour chaque catégorie
  const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  // Ajout d'une zone de bornes sur les graphiques si applicable
  const getChartOptionsWithBounds = (dataKey: keyof typeof BORNES, label: string, color: string) => {
    const bounds = BORNES[dataKey];
    return {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        annotation: bounds ? {
          annotations: {
            zone: {
              type: 'box' as const,
              yMin: bounds.min,
              yMax: bounds.max,
              backgroundColor: 'rgba(34,197,94,0.10)', // vert pâle
              borderWidth: 0,
            },
            minLine: {
              type: 'line' as const,
              yMin: bounds.min,
              yMax: bounds.min,
              borderColor: '#22c55e',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: 'Min',
                position: 'start' as const,
                color: '#22c55e',
              },
            },
            maxLine: {
              type: 'line' as const,
              yMin: bounds.max,
              yMax: bounds.max,
              borderColor: '#22c55e',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: 'Max',
                position: 'end' as const,
                color: '#22c55e',
              },
            },
          },
        } : undefined,
      },
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
      {/* Onglets wireframe sous le header */}
      <nav className="bg-white border-b border-gray-300">
        <div className="container mx-auto px-6 flex space-x-2">
          {["Accueil", "Graphiques", "Commandes"].map(tab => (
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
        {activeTab === 'Accueil' ? (
          <div className="flex flex-col gap-8">
            {/* Groupe Ambiance */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Ambiance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Température ambiante */}
                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow p-6 flex flex-col items-center border border-sky-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-sky-900 mb-1">Température ambiante</h3>
                  <span className="text-3xl font-extrabold text-sky-600 mb-1">{latestData ? latestData.temperature.toFixed(1) + ' °C' : '--'}</span>
                  <span className="text-xs text-sky-400">Dernière mesure</span>
                </div>
                {/* Humidité ambiante */}
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow p-6 flex flex-col items-center border border-violet-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-violet-900 mb-1">Humidité ambiante</h3>
                  <span className="text-3xl font-extrabold text-violet-600 mb-1">{latestData ? latestData.humidity.toFixed(1) + ' %' : '--'}</span>
                  <span className="text-xs text-violet-400">Dernière mesure</span>
                </div>
              </div>
            </div>
            {/* Groupe Réservoir */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Réservoir</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Conductivité réservoir */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-purple-900 mb-1">Conductivité</h3>
                  <span className="text-3xl font-extrabold text-purple-600 mb-1">{latestData ? latestData.ecReservoir.toFixed(2) + ' mS/cm' : '--'}</span>
                  <span className="text-xs text-purple-400">Dernière mesure</span>
                </div>
                {/* pH réservoir */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-fuchsia-900 mb-1">pH</h3>
                  <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">{latestData ? latestData.phReservoir.toFixed(2) : '--'}</span>
                  <span className="text-xs text-fuchsia-400">Dernière mesure</span>
                </div>
                {/* Oxygène réservoir */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-blue-900 mb-1">Oxygène dissous</h3>
                  <span className="text-3xl font-extrabold text-blue-600 mb-1">{latestData ? latestData.oxygenReservoir.toFixed(1) + ' %' : '--'}</span>
                  <span className="text-xs text-blue-400">Dernière mesure</span>
                </div>
                {/* Niveau d'eau du réservoir */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow p-6 flex flex-col items-center border border-cyan-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-cyan-900 mb-1">Niveau d'eau</h3>
                  <WaterLevel level={waterLevel.level} />
                </div>
              </div>
            </div>
            {/* Groupe Bac du système */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Bac du système</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Conductivité bac */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-purple-900 mb-1">Conductivité</h3>
                  <span className="text-3xl font-extrabold text-purple-600 mb-1">{latestData ? latestData.ecBac.toFixed(2) + ' mS/cm' : '--'}</span>
                  <span className="text-xs text-purple-400">Dernière mesure</span>
                </div>
                {/* pH bac */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-fuchsia-900 mb-1">pH</h3>
                  <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">{latestData ? latestData.phBac.toFixed(2) : '--'}</span>
                  <span className="text-xs text-fuchsia-400">Dernière mesure</span>
                </div>
                {/* Oxygène bac */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-blue-900 mb-1">Oxygène dissous</h3>
                  <span className="text-3xl font-extrabold text-blue-600 mb-1">{latestData ? latestData.oxygenBac.toFixed(1) + ' %' : '--'}</span>
                  <span className="text-xs text-blue-400">Dernière mesure</span>
                </div>
                {/* Niveau d'eau du bac du système */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow p-6 flex flex-col items-center border border-rose-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-rose-900 mb-1">Niveau d'eau</h3>
                  <WaterLevel level={Math.max(0, waterLevel.level - 55)} />
                  {waterLevel.level - 55 < 20 && (
                    <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
                      Niveau critique! Remplissez le réservoir dès que possible.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'Graphiques' ? (
          <div className="flex flex-col gap-10">
            {/* Section Ambiance */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Ambiance</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['temperature', 'humidity'].map(key => {
                  const chart = chartList.find(c => c.key === key)!;
                  const chartData = getChartData(chart.dataKey as any, chart.label, chart.color);
                  return (
                    <div key={chart.key} className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative">
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
                        <Line data={chartData} options={getChartOptionsWithBounds(chart.dataKey as any, chart.label, chart.color)} />
                      ) : (
                        <div className="text-gray-400 text-sm">Aucune donnée à afficher</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Section Réservoir */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Réservoir</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['phReservoir', 'oxygenReservoir', 'ecReservoir'].map(key => {
                  const chart = chartList.find(c => c.key === key)!;
                  const chartData = getChartData(chart.dataKey as any, chart.label, chart.color);
                  return (
                    <div key={chart.key} className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative">
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
                        <Line data={chartData} options={getChartOptionsWithBounds(chart.dataKey as any, chart.label, chart.color)} />
                      ) : (
                        <div className="text-gray-400 text-sm">Aucune donnée à afficher</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Section Bac du système */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Bac du système</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['phBac', 'oxygenBac', 'ecBac'].map(key => {
                  const chart = chartList.find(c => c.key === key)!;
                  const chartData = getChartData(chart.dataKey as any, chart.label, chart.color);
                  return (
                    <div key={chart.key} className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative">
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
                        <Line data={chartData} options={getChartOptionsWithBounds(chart.dataKey as any, chart.label, chart.color)} />
                      ) : (
                        <div className="text-gray-400 text-sm">Aucune donnée à afficher</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'Commandes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bloc Commandes */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col justify-center border border-gray-300 min-h-[340px]">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Ouverture des valves</span>
                  <div className="flex gap-4">
                    <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">Ouverture</button>
                    <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">Fermeture</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Ajouter des nutriments</span>
                  <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">Ajouter</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Remplir le bac d'eau du système</span>
                  <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">Remplir</button>
                </div>
              </div>
            </div>
            {/* Bloc graphique Conductivité (réservoir) */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col border border-gray-300 min-h-[340px]">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Évolution de la conductivité (réservoir)</h2>
              <div className="flex-1 min-h-[220px]">
                {getChartData('ecReservoir', 'Conductivité (réservoir)', '#a855f7') ? (
                  <Line data={getChartData('ecReservoir', 'Conductivité (réservoir)', '#a855f7')!} options={chartOptions} />
                ) : (
                  <div className="text-gray-400 text-sm">Aucune donnée à afficher</div>
                )}
              </div>
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