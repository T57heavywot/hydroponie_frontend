import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import "./App.css";
import WaterLevel from "./WaterLevel";
import GaugeBar from "./GaugeBar";
import EventBadgeOverlay from "./EventBadgeOverlay";
import AddPlantModal from "./AddPlantModal";
import EventForm from "./EventForm";
import EventList from "./EventList";
import ChartSection from "./ChartSection";
import PlantBoundsCSVButtons from "./PlantBoundsCSVButtons";
import InfoBox from "./InfoBox";
import ChartTimeSelector from "./ChartTimeSelector";
import AmbianceSection from "./AmbianceSection";
import ReservoirSection from "./ReservoirSection";
import BacSection from "./BacSection";
import GraphiquesTab from "./GraphiquesTab";
import TabNavigation from "./TabNavigation";
import EditPlantBoundsForm from "./EditPlantBoundsForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  TimeScale
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
  waterLevelReservoir: number;
  waterLevelBac: number;
}

// Transforme les données brutes de l'API en format exploitable par les graphiques
function mapSensorData(rawData: any[]): SensorData[] {
  // Regroupe par timestamp
  const grouped: Record<string, any> = {};
  rawData.forEach(([timestamp, capteur, param, valeur]) => {
    if (!grouped[timestamp]) grouped[timestamp] = { timestamp };
    // Mappe les noms pour correspondre à tes clés de chartList
    let key = "";
    if (capteur === "Climat" && param === "temperature") key = "temperature";
    else if (capteur === "Climat" && param === "humidity") key = "humidity";
    else if (capteur === "EC Reservoir" && param === "ec") key = "ecReservoir";
    else if (capteur === "DO Reservoir" && param === "do") key = "oxygenReservoir";
    else if (capteur === "pH Reservoir" && param === "pH") key = "phReservoir";
    else if (capteur === "Niveau Eau Reservoir" && param === "niveau") key = "waterLevelReservoir";
    else if (capteur === "EC Bac" && param === "ec") key = "ecBac";
    else if (capteur === "DO Bac" && param === "do") key = "oxygenBac";
    else if (capteur === "pH Bac" && param === "pH") key = "phBac";
    else if (capteur === "Niveau Eau Bac" && param === "niveau") key = "waterLevelBac";
    // Ajoute la valeur si la clé est reconnue
    if (key) grouped[timestamp][key] = valeur;
  });
  // Retourne un tableau trié par timestamp
  return Object.values(grouped).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState({ level: 0 });
  const [activeTab, setActiveTab] = useState<string>("Accueil");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [events, setEvents] = useState<
    {
      id: string;
      text: string;
      time: string;
      categories: string[];
    }[]
  >([]);
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  // Ajout d'un état pour le groupe de catégories sélectionné
  const [eventCategoryGroup, setEventCategoryGroup] = useState("");

  type BornesType = {
    [key: string]: { min: number; max: number };
  };
  const [editableBornes, setEditableBornes] = useState<BornesType>({});

  // Récupère les bornes dynamiques depuis l'API Flask au chargement
  useEffect(() => {
    const fetchBornes = async () => {
      try {
        const res = await fetch('/api/config/bornes');
        const text = await res.text();
        console.log('Réponse brute /api/config/bornes:', text);
        const bornes = JSON.parse(text);
        setEditableBornes(bornes);
      } catch (error) {
        console.error('Erreur lors de la récupération des bornes:', error);
      }
    };
    fetchBornes();
  }, []);

  // Bornes par défaut pour chaque plante
  const DEFAULT_PLANT_BORNES = {
    basilic: {
      phReservoir: { min: 5.5, max: 6.5 },
      phBac: { min: 5.5, max: 6.5 },
      ecReservoir: { min: 1.2, max: 1.6 },
      ecBac: { min: 1.2, max: 1.6 },
      oxygenReservoir: { min: 80, max: 100 },
      oxygenBac: { min: 80, max: 100 },
      temperature: { min: 20, max: 28 },
      humidity: { min: 50, max: 70 },
      waterLevelReservoir: { min: 20, max: 100 },
      waterLevelBac: { min: 10, max: 45 },
    },
    tomate: {
      phReservoir: { min: 5.5, max: 6.5 },
      phBac: { min: 5.5, max: 6.5 },
      ecReservoir: { min: 2.0, max: 5.0 },
      ecBac: { min: 2.0, max: 5.0 },
      oxygenReservoir: { min: 80, max: 100 },
      oxygenBac: { min: 80, max: 100 },
      temperature: { min: 18, max: 26 },
      humidity: { min: 40, max: 70 },
      waterLevelReservoir: { min: 20, max: 100 },
      waterLevelBac: { min: 10, max: 45 },
    },
  } as const;

  type PlantKey = keyof typeof DEFAULT_PLANT_BORNES | "";
  const [selectedPlant, setSelectedPlant] = useState<PlantKey>("");
  const [plantBornes, setPlantBornes] = useState<any>({
    ...DEFAULT_PLANT_BORNES,
  });

  // Liste des graphiques disponibles
  const chartList = [
    {
      key: "oxygenReservoir",
      label: "Oxygène dissous (réservoir)",
      dataKey: "oxygenReservoir",
      color: "#3b82f6",
    },
    {
      key: "oxygenBac",
      label: "Oxygène dissous (bac)",
      dataKey: "oxygenBac",
      color: "#2563eb",
    },
    {
      key: "ecReservoir",
      label: "Conductivité (réservoir)",
      dataKey: "ecReservoir",
      color: "#a855f7",
    },
    {
      key: "ecBac",
      label: "Conductivité (bac)",
      dataKey: "ecBac",
      color: "#7c3aed",
    },
    {
      key: "phReservoir",
      label: "pH (réservoir)",
      dataKey: "phReservoir",
      color: "#f472b6",
    },
    { key: "phBac", label: "pH (bac)", dataKey: "phBac", color: "#f59e42" },
    {
      key: "temperature",
      label: "Température ambiante",
      dataKey: "temperature",
      color: "#3b82f6",
    },
    {
      key: "humidity",
      label: "Humidité ambiante",
      dataKey: "humidity",
      color: "#a855f7",
    },
    {
      key: "waterLevelReservoir",
      label: "Niveau d'eau du réservoir",
      dataKey: "waterLevelReservoir",
      color: "#06b6d4",
    },
    {
      key: "waterLevelBac",
      label: "Niveau d'eau du bac du système",
      dataKey: "waterLevelBac",
      color: "#f43f5e",
    },
  ];

  const chartRefs = useRef<Record<string, any>>({});

  // Remettre l'état pour la période d'affichage des graphiques
  const [selectedHours, setSelectedHours] = useState<number>(6);

  // Fonction de mapping des données API brutes vers l'objet sensorData[] attendu
  function mapSensorData(rawData: any[]): any[] {
    // On regroupe par timestamp
    const grouped: Record<string, any> = {};
    rawData.forEach((row: any[]) => {
      const [timestamp, capteur, param, valeur] = row;
      if (!grouped[timestamp]) {
        grouped[timestamp] = {
          timestamp,
          temperature: undefined,
          humidity: undefined,
          ecReservoir: undefined,
          phReservoir: undefined,
          oxygenReservoir: undefined,
          ecBac: undefined,
          phBac: undefined,
          oxygenBac: undefined,
        };
      }
      // Mapping selon capteur/param
      if (capteur === "Climat" && param === "temperature") grouped[timestamp].temperature = valeur;
      if (capteur === "Climat" && param === "humidity") grouped[timestamp].humidity = valeur;
      if (capteur === "EC Reservoir" && param === "ec") grouped[timestamp].ecReservoir = typeof valeur === "string" ? parseFloat(valeur) : valeur;
      if (capteur === "pH Reservoir" && param === "pH") grouped[timestamp].phReservoir = valeur;
      if (capteur === "DO Reservoir" && param === "do") grouped[timestamp].oxygenReservoir = valeur;
      if (capteur === "EC Bac" && param === "ec") grouped[timestamp].ecBac = typeof valeur === "string" ? parseFloat(valeur) : valeur;
      if (capteur === "pH Bac" && param === "pH") grouped[timestamp].phBac = valeur;
      if (capteur === "DO Bac" && param === "do") grouped[timestamp].oxygenBac = valeur;
    });
    // Retourne trié par timestamp croissant
    return Object.values(grouped).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupère les vraies données capteurs depuis l'API Flask
        const res = await fetch(`/api/sensors/data`);
        const text = await res.text();
        console.log('Réponse brute /api/sensors/data:', text);
        const data = JSON.parse(text);
        setSensorData(mapSensorData(data));
        // Si tu as une route pour le niveau d'eau séparé, adapte ici
        // const resWater = await fetch(`/api/water-level`);
        // const water = await resWater.json();
        // setWaterLevel(water);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedHours]);

  // Génère les annotations pour un graphique donné
  // Correction du typage dans getEventAnnotations
  function getEventAnnotations(category: string) {
    const filtered = events.filter((ev: any) =>
      ev.categories.includes(category)
    );
    const annotationsObj: Record<string, any> = {};
    filtered.forEach((ev: any, idx: number) => {
      annotationsObj[`event${idx}`] = {
        type: "line",
        xMin: new Date(ev.time),
        xMax: new Date(ev.time),
        borderColor: "#f59e42",
        borderWidth: 2,
        label: {
          display: false,
          content: ev.text,
          enabled: true,
          position: "start",
          backgroundColor: "#f59e42",
          color: "#fff",
          font: { weight: "bold", size: 12 },
          callout: true, // info-bulle au survol (chartjs-plugin-annotation >= 3.0.0)
        },
      };
    });
    return annotationsObj;
  }

  // Correction des signatures pour accepter string en dataKey
  const getChartData = (
    dataKey: string, // au lieu de keyof SensorData
    label: string,
    color: string
  ) => {
    // Toujours retourner un dataset, même vide, pour que le graphique s'affiche
    return {
      datasets: [
        {
          label,
          data: sensorData.length
            ? sensorData.map((data) => ({
                x: new Date(data.timestamp),
                y:
                  typeof (data as any)[dataKey] === "object"
                    ? null
                    : (data as any)[dataKey],
              }))
            : [],
          borderColor: color,
          backgroundColor: color + "20",
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
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Gestion de la sélection des graphiques
  const handleChartSelect = (key: string) => {
    setSelectedCharts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Récupérer la dernière valeur pour chaque catégorie
  const latestData =
    sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  // Ajout d'une zone de bornes sur les graphiques si applicable
  const getChartOptionsWithBounds = (
    dataKey: string, // au lieu de keyof typeof BORNES
    label: string,
    color: string,
    category?: string
  ) => {
    const bounds = (editableBornes as any)[dataKey];
    const eventAnnotations = getEventAnnotations(category || "");
    const annotations: Record<string, any> = { ...eventAnnotations };
    if (bounds) {
      annotations.zone = {
        type: "box",
        yMin: bounds.min,
        yMax: bounds.max,
        backgroundColor: "rgba(34,197,94,0.10)",
        borderWidth: 0,
      };
      annotations.minLine = {
        type: "line",
        yMin: bounds.min,
        yMax: bounds.min,
        borderColor: "#22c55e",
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          display: true,
          content: "Min",
          position: "start",
          color: "#22c55e",
        },
      };
      annotations.maxLine = {
        type: "line",
        yMin: bounds.max,
        yMax: bounds.max,
        borderColor: "#22c55e",
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          display: true,
          content: "Max",
          position: "end",
          color: "#22c55e",
        },
      };
    }
    return {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        annotation: {
          annotations,
        },
      },
      scales: {
        x: {
          type: "time" as const, // forcer le littéral
          time: {
            unit: "hour" as const, // forcer le littéral accepté par Chart.js
            displayFormats: {
              hour: "HH:mm",
              minute: "HH:mm",
            },
          },
          title: {
            display: true,
            text: "Heure",
          },
        },
        y: chartOptions.scales.y,
      },
    };
  };

  // Ajout d'un événement
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventText || !eventTime || eventCategories.length === 0) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        text: eventText,
        time: eventTime,
        categories: eventCategories,
      },
    ]);
    setEventText("");
    setEventTime("");
    setEventCategories([]);
    setEventCategoryGroup("");
  };

  // Met à jour les bornes selon la plante sélectionnée
  useEffect(() => {
    if (selectedPlant && plantBornes[selectedPlant]) {
      setEditableBornes({ ...plantBornes[selectedPlant] });
    }
  }, [selectedPlant, plantBornes]);

  // Fonction pour envoyer la commande flush au serveur
  const handleFlushReservoir = async () => {
    try {
      const response = await fetch("/api/flush-reservoir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Commande de vidange envoyée au serveur !");
      } else {
        alert("Erreur lors de l'envoi de la commande de vidange.");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    }
  };

  // Dictionnaire de traduction des paramètres pour l'affichage
  const PARAM_LABELS: Record<string, string> = {
    phReservoir: "pH réservoir",
    phBac: "pH bac",
    ecReservoir: "Conductivité réservoir",
    ecBac: "Conductivité bac",
    oxygenReservoir: "Oxygène réservoir",
    oxygenBac: "Oxygène bac",
    temperature: "Température ambiante",
    humidity: "Humidité ambiante",
  };

  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantBornes, setNewPlantBornes] = useState<any>({
    phReservoir: { min: 5.5, max: 6.5 },
    phBac: { min: 5.5, max: 6.5 },
    ecReservoir: { min: 1.2, max: 2.0 },
    ecBac: { min: 1.2, max: 2.0 },
    oxygenReservoir: { min: 80, max: 100 },
    oxygenBac: { min: 80, max: 100 },
    temperature: { min: 18, max: 26 },
    humidity: { min: 40, max: 70 },
    waterLevelReservoir: { min: 20, max: 100 },
    waterLevelBac: { min: 10, max: 45 },
  });

  // Handlers pour l'import/export CSV des bornes
  const handleExportPlantBoundsCSV = () => {
    const rows = ["Plant;Parameter;Min;Max"];
    Object.entries(plantBornes).forEach(([plant, params]) => {
      Object.entries(
        params as { [key: string]: { min: number; max: number } }
      ).forEach(([param, val]) => {
        rows.push(`${plant};${param};${val.min};${val.max}`);
      });
    });
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plant_bounds.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleImportPlantBoundsCSV = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1);
      const newPlantBornes: any = { ...plantBornes };
      lines.forEach((line) => {
        const [plant, param, min, max] = line.split(";");
        if (plant && param && min !== undefined && max !== undefined) {
          const key = plant as keyof typeof newPlantBornes;
          if (!newPlantBornes[key]) {
            newPlantBornes[key] = {};
          }
          newPlantBornes[key][param] = {
            min: parseFloat(min),
            max: parseFloat(max),
          };
        }
      });
      setPlantBornes(newPlantBornes);
      alert("Bornes importées avec succès !");
    };
    reader.readAsText(file, "UTF-8");
  };

  // Interface des props pour GraphiquesTab
  interface GraphiquesTabProps {
    selectedHours: number;
    setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
    eventText: string;
    setEventText: React.Dispatch<React.SetStateAction<string>>;
    eventTime: string;
    setEventTime: React.Dispatch<React.SetStateAction<string>>;
    eventCategoryGroup: string;
    setEventCategoryGroup: React.Dispatch<React.SetStateAction<string>>;
    eventCategories: string[];
    setEventCategories: React.Dispatch<React.SetStateAction<string[]>>;
    chartList: any[];
    handleAddEvent: (e: React.FormEvent) => void;
    events: any[];
    setEvents: React.Dispatch<React.SetStateAction<any[]>>;
    selectedCharts: string[];
    handleChartSelect: (key: string) => void;
    chartRefs: React.MutableRefObject<Record<string, any>>;
    getChartData: (dataKey: string, label: string, color: string) => any;
    getChartOptionsWithBounds: (dataKey: string, label: string, color: string, category?: string) => any;
    EventBadgeOverlay: any;
  }

  // --- ASSEMBLAGE PRINCIPAL DES COMPOSANTS ---
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
      {/* Navigation des onglets */}
      <nav className="bg-white border-b border-gray-300">
        <div className="container mx-auto px-6 flex space-x-2">
          {["Accueil", "Graphiques", "Commandes"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 mt-1 border-b-2 font-medium transition-colors duration-150 focus:outline-none ${
                activeTab === tab
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-700 hover:text-green-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main className="container mx-auto py-8 px-6">
        {/* --- ACCUEIL --- */}
        {activeTab === "Accueil" && (
          <div className="flex flex-col gap-8">
            {/* Groupe Ambiance */}
            <AmbianceSection
              latestData={latestData && { temperature: latestData.temperature, humidity: latestData.humidity }}
              editableBornes={editableBornes as any}
            />
            {/* Groupe Réservoir */}
            <ReservoirSection
              latestData={latestData && {
                ecReservoir: latestData.ecReservoir,
                phReservoir: latestData.phReservoir,
                oxygenReservoir: latestData.oxygenReservoir
              }}
              waterLevel={waterLevel}
              editableBornes={editableBornes as any}
            />
            {/* Groupe Bac du système */}
            <BacSection
              latestData={latestData && {
                ecBac: latestData.ecBac,
                phBac: latestData.phBac,
                oxygenBac: latestData.oxygenBac
              }}
              waterLevel={waterLevel}
              editableBornes={editableBornes as any}
            />
          </div>
        )}
        {/* --- GRAPHIQUES --- */}
        {activeTab === "Graphiques" && (
          <GraphiquesTab
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            eventText={eventText}
            setEventText={setEventText}
            eventTime={eventTime}
            setEventTime={setEventTime}
            eventCategoryGroup={eventCategoryGroup}
            setEventCategoryGroup={setEventCategoryGroup}
            eventCategories={eventCategories}
            setEventCategories={setEventCategories}
            chartList={chartList}
            handleAddEvent={handleAddEvent}
            events={events}
            setEvents={setEvents}
            selectedCharts={selectedCharts}
            handleChartSelect={handleChartSelect}
            chartRefs={chartRefs}
            getChartData={getChartData}
            getChartOptionsWithBounds={getChartOptionsWithBounds}
            EventBadgeOverlay={EventBadgeOverlay}
            sensorData={sensorData}
          />
        )}
        {/* --- COMMANDES --- */}
        {activeTab === "Commandes" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bloc Actions rapides avec sélecteur de plante */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-8 border border-gray-300 min-w-[350px] max-w-lg w-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    Actions rapides
                  </h2>
                  {/* Sélecteur de plante */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plante par défaut
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={selectedPlant}
                        onChange={(e) =>
                          setSelectedPlant(e.target.value as PlantKey)
                        }
                      >
                        <option value="">-- Choisir une plante --</option>
                        {Object.keys(plantBornes).map((plant) => (
                          <option key={plant} value={plant}>
                            {plant.charAt(0).toUpperCase() + plant.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-green-100 text-green-800 border border-green-600 rounded font-semibold hover:bg-green-200"
                        onClick={() => {
                          setNewPlantName("");
                          setNewPlantBornes({
                            phReservoir: { min: 5.5, max: 6.5 },
                            phBac: { min: 5.5, max: 6.5 },
                            ecReservoir: { min: 1.2, max: 2.0 },
                            ecBac: { min: 1.2, max: 2.0 },
                            oxygenReservoir: { min: 80, max: 100 },
                            oxygenBac: { min: 80, max: 100 },
                            temperature: { min: 18, max: 26 },
                            humidity: { min: 40, max: 70 },
                            waterLevelReservoir: { min: 20, max: 100 },
                            waterLevelBac: { min: 10, max: 45 },
                          });
                          setShowAddPlantModal(true);
                        }}
                        title="Ajouter une nouvelle plante"
                      >
                        + Ajouter une plante
                      </button>
                    </div>
                  </div>
                  {/* Actions rapides */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Ouverture des valves
                      </span>
                      <div className="flex gap-2">
                        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                          Ouverture
                        </button>
                        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                          Fermeture
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Ajouter des nutriments
                      </span>
                      <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                        Ajouter
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Remplir le bac d'eau du système
                      </span>
                      <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                        Remplir
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Vidanger le réservoir
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-red-600 text-red-600 rounded font-semibold bg-white hover:bg-red-50"
                        onClick={handleFlushReservoir}
                      >
                        Vidanger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bloc édition des bornes */}
              <div className="bg-white rounded-xl shadow p-8 border border-gray-300 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Modifier les bornes des graphiques
                </h2>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  {Object.entries(editableBornes)
                    .filter(
                      ([key]) =>
                        key !== "waterLevelReservoir" && key !== "waterLevelBac"
                    )
                    .map(([key, val]) => {
                      const typedKey = key as keyof typeof editableBornes;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-48 font-medium text-gray-700">
                            {PARAM_LABELS[key] || key}
                          </span>
                          <label className="text-sm">Min</label>
                          <input
                            type="number"
                            step="any"
                            className="border rounded px-2 py-1 w-20"
                            value={(val as { min: number; max: number }).min}
                            onChange={(e) =>
                              setEditableBornes((b: BornesType) => ({
                                ...b,
                                [typedKey]: {
                                  ...b[typedKey],
                                  min: parseFloat(e.target.value),
                                },
                              }))
                            }
                          />
                          <label className="text-sm">Max</label>
                          <input
                            type="number"
                            step="any"
                            className="border rounded px-2 py-1 w-20"
                            value={(val as { min: number; max: number }).max}
                            onChange={(e) =>
                              setEditableBornes((b: BornesType) => ({
                                ...b,
                                [typedKey]: {
                                  ...b[typedKey],
                                  max: parseFloat(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 self-end"
                    onClick={() => {
                      if (selectedPlant) {
                        setPlantBornes((prev: any) => ({
                          ...prev,
                          [selectedPlant]: { ...editableBornes },
                        }));
                        alert(
                          "Bornes enregistrées pour la plante sélectionnée !"
                        );
                      }
                    }}
                  >
                    Enregistrer
                  </button>
                </form>
                <PlantBoundsCSVButtons
                  plantBornes={plantBornes}
                  setPlantBornes={setPlantBornes}
                  selectedPlant={selectedPlant}
                  setEditableBornes={setEditableBornes}
                />
              </div>
            </div>
            {/* Modal d'ajout de plante */}
            <AddPlantModal
              show={showAddPlantModal}
              onClose={() => setShowAddPlantModal(false)}
              plantName={newPlantName}
              setPlantName={setNewPlantName}
              plantBornes={newPlantBornes}
              setPlantBornes={setNewPlantBornes}
              paramLabels={PARAM_LABELS}
              onSubmit={() => {
                const name = newPlantName.trim().toLowerCase();
                if (!name) {
                  alert("Veuillez saisir un nom de plante.");
                  return;
                }
                if (plantBornes[name]) {
                  alert("Cette plante existe déjà.");
                  return;
                }
                setPlantBornes((prev: any) => ({
                  ...prev,
                  [name]: { ...newPlantBornes },
                }));
                setNewPlantName("");
                setShowAddPlantModal(false);
              }}
            />
            {/* InfoBox d'implémentation */}
            <InfoBox />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
