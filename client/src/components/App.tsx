import React, { useState, useEffect, useRef } from "react";
import FillReservoirModal from "./FillReservoirModal";
import NutrientModal from "./NutrientModal";
import ConfirmDrainModal from "./ConfirmDrainModal";
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
import EventForm from "./EventForm";
import EventList from "./EventList";
import ChartSection from "./ChartSection";
import PlantBoundsCSVButtons from "./PlantBoundsCSVButtons";
import ActuatorsModal from "./ActuatorsModal";
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
  temperatureReservoir?: number;
  temperatureBac?: number;
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
    let key = "";
    if (capteur === "Climat" && param === "temperature") key = "temperature";
    else if (capteur === "Climat" && param === "humidity") key = "humidity";
    else if (capteur === "EC Reservoir" && param === "ec") key = "ecReservoir";
    else if (capteur === "DO Reservoir" && param === "do")
      key = "oxygenReservoir";
    else if (capteur === "pH Reservoir" && param === "pH") key = "phReservoir";
    else if (capteur === "Niveau Eau Reservoir" && param === "niveau")
      key = "waterLevelReservoir";
    else if (capteur === "EC Bac" && param === "ec") key = "ecBac";
    else if (capteur === "DO Bac" && param === "do") key = "oxygenBac";
    else if (capteur === "pH Bac" && param === "pH") key = "phBac";
    else if (capteur === "Niveau Eau Bac" && param === "niveau")
      key = "waterLevelBac";
    else if (capteur === "Thermocouple Reservoir" && param === "temperature")
      key = "temperatureReservoir";
    else if (capteur === "Thermocouple Bac" && param === "temperature")
      key = "temperatureBac";
    if (key) grouped[timestamp][key] = valeur;
  });
  // Retourne un tableau trié par timestamp
  return Object.values(grouped).sort(
    (a: any, b: any) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function App() {
  // Stocke l'état initial des bornes pour la comparaison
  const initialBornesRef = useRef<any>(null);
  // ...déclaration des états...
  // Mapping clé graphique -> { sensor_name, value_name }
  const keyToSensorValue = {
    phReservoir: { sensor_name: "pH Reservoir", value_name: "pH" },
    phBac: { sensor_name: "pH Bac", value_name: "pH" },
    ecReservoir: { sensor_name: "EC Reservoir", value_name: "ec" },
    ecBac: { sensor_name: "EC Bac", value_name: "ec" },
    oxygenReservoir: { sensor_name: "DO Reservoir", value_name: "do" },
    oxygenBac: { sensor_name: "DO Bac", value_name: "do" },
    temperature: { sensor_name: "Climat", value_name: "temperature" },
    temperatureReservoir: {
      sensor_name: "Thermocouple Reservoir",
      value_name: "temperature",
    },
    temperatureBac: {
      sensor_name: "Thermocouple Bac",
      value_name: "temperature",
    },
    humidity: { sensor_name: "Climat", value_name: "humidity" },
    // Ajoute d'autres mappings si besoin
  };
  // État pour la modale des actionneurs (valves, etc.)
  const [showActuatorsModal, setShowActuatorsModal] = useState(false);
  // Pour le futur : à remplacer par un fetch backend
  const [actuators, setActuators] = useState([
    { id: "valve1", name: "Valve 1", isOpen: false },
    { id: "valve2", name: "Valve 2", isOpen: false },
  ]);

  // Handler pour ouvrir/fermer un actionneur
  const handleToggleActuator = (id: string, open: boolean) => {
    setActuators((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isOpen: open } : a))
    );
    // TODO: Appeler le backend pour ouvrir/fermer l'actionneur
  };
  // États pour les popups
  const [showFillReservoir, setShowFillReservoir] = useState(false);
  const [showNutrientModal, setShowNutrientModal] = useState(false);
  const [showConfirmDrain, setShowConfirmDrain] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState({ level: 0 });
  const [activeTab, setActiveTab] = useState<string>("Accueil");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  // Événements persistants
  const [events, setEvents] = useState<any[]>([]);
  // Event sélectionné pour le surlignage
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  // Types d'événements disponibles (depuis backend)
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  // Sélection du type d'événement (obligatoire)
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  // Date/heure de l'événement (optionnelle)
  const [eventTime, setEventTime] = useState("");
  // Note de l'événement
  const [eventNote, setEventNote] = useState("");

  type BornesType = {
    [key: string]: { min: number; max: number };
  };
  const [editableBornes, setEditableBornes] = useState<BornesType>({});
  // Stocke l'état initial des bornes au premier montage
  useEffect(() => {
    if (
      editableBornes &&
      !initialBornesRef.current &&
      Object.keys(editableBornes).length > 0
    ) {
      initialBornesRef.current = JSON.parse(JSON.stringify(editableBornes));
    }
  }, [editableBornes]);
  // Récupère les bornes min/max dynamiquement depuis l'API Flask /api/config
  useEffect(() => {
    const fetchBornes = async () => {
      try {
        const res = await fetch("/api/config");
        const text = await res.text();
        console.log("[DEBUG] Réponse brute /api/config:", text);
        const data = JSON.parse(text);
        // Construction du mapping capteur/paramètre -> clé de graphique
        // Ex: { temperature: { min: 15, max: 30 }, ... }
        const bornes: Record<string, { min: number; max: number }> = {};
        const sensors =
          data && data.config && data.config.sensors ? data.config.sensors : [];
        sensors.forEach((sensor: any) => {
          if (sensor.values && Array.isArray(sensor.values)) {
            sensor.values.forEach((val: any) => {
              // Mappe le nom du capteur + paramètre vers la clé utilisée dans chartList
              let key = "";
              if (sensor.name === "Climat" && val.name === "temperature")
                key = "temperature";
              else if (sensor.name === "Climat" && val.name === "humidity")
                key = "humidity";
              else if (sensor.name === "EC Reservoir" && val.name === "ec")
                key = "ecReservoir";
              else if (sensor.name === "DO Reservoir" && val.name === "do")
                key = "oxygenReservoir";
              else if (sensor.name === "pH Reservoir" && val.name === "pH")
                key = "phReservoir";
              else if (
                sensor.name === "Niveau Eau Reservoir" &&
                val.name === "niveau"
              )
                key = "waterLevelReservoir";
              else if (sensor.name === "EC Bac" && val.name === "ec")
                key = "ecBac";
              else if (sensor.name === "DO Bac" && val.name === "do")
                key = "oxygenBac";
              else if (sensor.name === "pH Bac" && val.name === "pH")
                key = "phBac";
              else if (
                sensor.name === "Niveau Eau Bac" &&
                val.name === "niveau"
              )
                key = "waterLevelBac";
              else if (
                sensor.name === "Thermocouple Reservoir" &&
                val.name === "temperature"
              )
                key = "temperatureReservoir";
              else if (
                sensor.name === "Thermocouple Bac" &&
                val.name === "temperature"
              )
                key = "temperatureBac";
              if (key) {
                bornes[key] = { min: val.lower_limit, max: val.upper_limit };
              }
            });
          }
        });
        setEditableBornes(bornes);
        // Debug : afficher les clés présentes et attendues
        const expected = [
          "temperature",
          "humidity",
          "ecReservoir",
          "phReservoir",
          "oxygenReservoir",
          "ecBac",
          "phBac",
          "oxygenBac",
          "waterLevelReservoir",
          "waterLevelBac",
          "temperatureReservoir",
          "temperatureBac",
        ];
        console.log("[DEBUG] Clés bornes récupérées:", Object.keys(bornes));
        console.log("[DEBUG] Clés attendues:", expected);
        expected.forEach((key) => {
          if (!bornes[key]) {
            console.warn(`[DEBUG] Borne manquante pour : ${key}`);
          }
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des bornes:", error);
      }
    };
    fetchBornes();
  }, []);

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
      key: "temperatureReservoir",
      label: "Température réservoir",
      dataKey: "temperatureReservoir",
      color: "#3b82f6",
    },
    {
      key: "temperatureBac",
      label: "Température bac",
      dataKey: "temperatureBac",
      color: "#2563eb",
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
          temperatureReservoir: undefined,
          temperatureBac: undefined,
        };
      }
      // Mapping selon capteur/param
      if (capteur === "Climat" && param === "temperature")
        grouped[timestamp].temperature = valeur;
      if (capteur === "Climat" && param === "humidity")
        grouped[timestamp].humidity = valeur;
      if (capteur === "EC Reservoir" && param === "ec")
        grouped[timestamp].ecReservoir =
          typeof valeur === "string" ? parseFloat(valeur) : valeur;
      if (capteur === "pH Reservoir" && param === "pH")
        grouped[timestamp].phReservoir = valeur;
      if (capteur === "DO Reservoir" && param === "do")
        grouped[timestamp].oxygenReservoir = valeur;
      if (capteur === "EC Bac" && param === "ec")
        grouped[timestamp].ecBac =
          typeof valeur === "string" ? parseFloat(valeur) : valeur;
      if (capteur === "pH Bac" && param === "pH")
        grouped[timestamp].phBac = valeur;
      if (capteur === "DO Bac" && param === "do")
        grouped[timestamp].oxygenBac = valeur;
      if (capteur === "Thermocouple Reservoir" && param === "temperature")
        grouped[timestamp].temperatureReservoir =
          typeof valeur === "string" ? parseFloat(valeur) : valeur;
      if (capteur === "Thermocouple Bac" && param === "temperature")
        grouped[timestamp].temperatureBac =
          typeof valeur === "string" ? parseFloat(valeur) : valeur;
    });
    // Retourne trié par timestamp croissant
    return Object.values(grouped).sort(
      (a: any, b: any) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/sensors/data`);
        const text = await res.text();
        console.log("Réponse brute /api/sensors/data:", text);
        const data = JSON.parse(text);
        setSensorData(mapSensorData(data));
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

  // Affiche uniquement la ligne d'événement sans la note et dans la période sélectionnée
  function getEventAnnotations(_: string) {
    const annotationsObj: Record<string, any> = {};
    if (sensorData.length > 0 && selectedHours > 0) {
      const lastTimestamp = new Date(
        sensorData[sensorData.length - 1].timestamp
      ).getTime();
      const msRange = selectedHours * 60 * 60 * 1000;
      const startTime = lastTimestamp - msRange;
      events.forEach((ev: any, idx: number) => {
        const eventTime = new Date(ev.timestamp).getTime();
        // Affiche uniquement si l'événement est dans la période affichée
        if (eventTime >= startTime && eventTime <= lastTimestamp) {
          const isSelected = selectedEventId === idx;
          const lineColor = isSelected ? "#2563eb" : "#f59e42";
          annotationsObj[`event${idx}`] = {
            type: "line",
            xMin: new Date(ev.timestamp),
            xMax: new Date(ev.timestamp),
            borderColor: lineColor,
            borderWidth: isSelected ? 3 : 2,
            label: {
              display: false,
            },
          };
        }
      });
    }
    return annotationsObj;
  }

  // Correction des signatures pour accepter string en dataKey
  const getChartData = (
    dataKey: string, // au lieu de keyof SensorData
    label: string,
    color: string
  ) => {
    // Filtrer les données selon la période sélectionnée
    let filtered = sensorData;
    if (sensorData.length > 0 && selectedHours > 0) {
      const lastTimestamp = new Date(
        sensorData[sensorData.length - 1].timestamp
      ).getTime();
      const msRange = selectedHours * 60 * 60 * 1000;
      filtered = sensorData.filter((data) => {
        const t = new Date(data.timestamp).getTime();
        return t >= lastTimestamp - msRange && t <= lastTimestamp;
      });
      // Si aucune donnée dans la période sélectionnée, afficher tout (pour éviter un graphique vide)
      if (filtered.length === 0) {
        filtered = sensorData;
      }
    }
    return {
      datasets: [
        {
          label,
          data: filtered.length
            ? filtered.map((data) => ({
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
    // Calcule min/max Y dynamiquement comme getChartData
    let filtered = sensorData;
    if (sensorData.length > 0 && selectedHours > 0) {
      const lastTimestamp = new Date(
        sensorData[sensorData.length - 1].timestamp
      ).getTime();
      const msRange = selectedHours * 60 * 60 * 1000;
      filtered = sensorData.filter((data) => {
        const t = new Date(data.timestamp).getTime();
        return t >= lastTimestamp - msRange && t <= lastTimestamp;
      });
      if (filtered.length === 0) {
        filtered = sensorData;
      }
    }
    const values: number[] = filtered
      .map((data: any) => {
        let v = (data as any)[dataKey];
        if (
          (dataKey === "ecReservoir" || dataKey === "ecBac") &&
          typeof v === "string"
        ) {
          const match = v.match(/^[0-9.]+/);
          v = match ? parseFloat(match[0]) : NaN;
        }
        return typeof v === "number" && !isNaN(v) ? v : undefined;
      })
      .filter((v): v is number => typeof v === "number" && !isNaN(v));
    let minValue = undefined;
    let maxValue = undefined;
    if (values.length > 0) {
      minValue = Math.min(...values);
      maxValue = Math.max(...values);
      if (minValue === maxValue) {
        minValue = minValue - 1;
        maxValue = maxValue + 1;
      }
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
          type: "time" as const,
          time: {
            unit: "hour" as const,
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
        y: {
          beginAtZero: false,
          min: minValue !== undefined ? minValue : undefined,
          max: maxValue !== undefined ? maxValue : undefined,
        },
      },
    };
  };

  // Récupère les types d'événements depuis le backend
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const res = await fetch("/api/event_type");
        const types = await res.json();
        setEventTypes(types);
      } catch (e) {
        setEventTypes([]);
      }
    };
    fetchEventTypes();
  }, []);

  // Récupère la liste des événements depuis le backend
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/event");
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Ajout d'un événement (POST)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventType) {
      alert("Veuillez sélectionner un type d'événement.");
      return;
    }
    try {
      // Si pas de date/heure, utiliser la date actuelle
      const timestamp =
        eventTime && eventTime.length > 0
          ? eventTime
          : new Date().toISOString();
      const payload = {
        event_name: selectedEventType,
        event_type: selectedEventType,
        timestamp,
        event_note: eventNote,
      };
      const res = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSelectedEventType("");
        setEventTime("");
        setEventNote("");
        fetchEvents();
      } else {
        const err = await res.json();
        alert(
          "Erreur lors de l'ajout de l'événement : " + (err.error || res.status)
        );
      }
    } catch (e) {
      alert("Erreur lors de l'ajout de l'événement.");
    }
  };

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

  const handleVidangeBac = () => {
    // Affiche une pop-up de confirmation ou déclenche la commande réelle
    alert("Le bac est en train d'être vidangé.");
    // TODO: Intégrer l'appel backend ici
  };

  // Dictionnaire de traduction des paramètres pour l'affichage
  const PARAM_LABELS: Record<string, string> = {
    phReservoir: "pH réservoir",
    phBac: "pH bac",
    ecReservoir: "Conductivité réservoir [mS/cm]",
    ecBac: "Conductivité bac [mS/cm]",
    oxygenReservoir: "Oxygène réservoir [mg/L]",
    oxygenBac: "Oxygène bac [mg/L]",
    temperature: "Température ambiante [°C]",
    temperatureReservoir: "Température réservoir [°C]",
    temperatureBac: "Température bac [°C]",
    humidity: "Humidité ambiante [%]",
  };
  // Interface des props pour GraphiquesTab
  interface GraphiquesTabProps {
    selectedHours: number;
    setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
    chartList: any[];
    selectedCharts: string[];
    handleChartSelect: (key: string) => void;
    chartRefs: React.MutableRefObject<Record<string, any>>;
    getChartData: (dataKey: string, label: string, color: string) => any;
    getChartOptionsWithBounds: (
      dataKey: string,
      label: string,
      color: string,
      category?: string
    ) => any;
    EventBadgeOverlay: any;
    sensorData: SensorData[];
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
      {/* Modals popups */}
      <FillReservoirModal
        show={showFillReservoir}
        onClose={() => setShowFillReservoir(false)}
        onDone={() => {
          setShowFillReservoir(false);
          setShowNutrientModal(true);
        }}
      />
      <NutrientModal
        show={showNutrientModal}
        onClose={() => setShowNutrientModal(false)}
        onSubmit={(nutrients) => {
          setShowNutrientModal(false);
          // Ici tu peux gérer l'envoi des valeurs au backend ou afficher une confirmation
          alert(
            "Nutriments ajoutés : " +
              nutrients.map((n) => `${n.type}: ${n.value}ml`).join(", ")
          );
        }}
      />
      <ConfirmDrainModal
        show={showConfirmDrain}
        onClose={() => setShowConfirmDrain(false)}
        onConfirm={() => {
          setShowConfirmDrain(false);
          handleFlushReservoir();
        }}
      />
      <main className="container mx-auto py-8 px-6">
        {/* --- ACCUEIL --- */}
        {activeTab === "Accueil" && (
          <div className="flex flex-col gap-8">
            {/* Groupe Ambiance */}
            <AmbianceSection
              latestData={
                latestData && {
                  temperature: latestData.temperature,
                  humidity: latestData.humidity,
                }
              }
              editableBornes={editableBornes as any}
            />
            {/* Groupe Réservoir */}
            <ReservoirSection
              latestData={
                latestData && {
                  ecReservoir: latestData.ecReservoir,
                  phReservoir: latestData.phReservoir,
                  oxygenReservoir: latestData.oxygenReservoir,
                  temperatureReservoir: latestData.temperatureReservoir,
                }
              }
              waterLevel={waterLevel}
              editableBornes={editableBornes as any}
            />
            {/* Groupe Bac du système */}
            <BacSection
              latestData={
                latestData && {
                  ecBac: latestData.ecBac,
                  phBac: latestData.phBac,
                  oxygenBac: latestData.oxygenBac,
                  temperatureBac: latestData.temperatureBac,
                }
              }
              waterLevel={waterLevel}
              editableBornes={editableBornes as any}
            />
          </div>
        )}
        {/* --- GRAPHIQUES --- */}
        {activeTab === "Graphiques" && (
          <div>
            {/* Formulaire d'ajout d'événement */}
            <form
              className="flex gap-4 items-end mb-4"
              onSubmit={handleAddEvent}
            >
              <div className="flex flex-col">
                <label className="text-sm font-medium">Type d'événement</label>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Date/heure</label>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Note</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  placeholder="Commentaire (optionnel)"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
              >
                Ajouter événement
              </button>
              <button
                type="button"
                className="ml-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={fetchEvents}
              >
                Rafraîchir
              </button>
            </form>
            {/* Liste des événements */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Horodatage</th>
                    <th className="px-2 py-1 border">Type</th>
                    <th className="px-2 py-1 border">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => (
                    <tr
                      key={idx}
                      onClick={() =>
                        setSelectedEventId(selectedEventId === idx ? null : idx)
                      }
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEventId === idx ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-2 py-1 border">
                        {ev.timestamp
                          ? new Date(ev.timestamp).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-2 py-1 border">{ev.event_type}</td>
                      <td className="px-2 py-1 border">{ev.event_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <GraphiquesTab
              selectedHours={selectedHours}
              setSelectedHours={setSelectedHours}
              chartList={chartList}
              selectedCharts={selectedCharts}
              handleChartSelect={handleChartSelect}
              chartRefs={chartRefs}
              getChartData={getChartData}
              getChartOptionsWithBounds={getChartOptionsWithBounds}
              EventBadgeOverlay={EventBadgeOverlay}
              sensorData={sensorData}
            />
          </div>
        )}
        {/* --- COMMANDES --- */}
        {activeTab === "Commandes" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bloc Actions rapides */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-8 border border-gray-300 min-w-[350px] max-w-lg w-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    Actions rapides
                  </h2>
                  {/* Sous-section Actionneurs */}
                  <div className="flex flex-col gap-4 border rounded-lg p-4 mb-4 bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">
                      Actionneurs
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Forcer les actionneurs
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-blue-600 text-blue-600 rounded font-semibold bg-white hover:bg-blue-100"
                        onClick={() => setShowActuatorsModal(true)}
                      >
                        Ouvrir
                      </button>
                    </div>
                    {/* Modale actionneurs (valves, etc.) */}
                    <ActuatorsModal
                      show={showActuatorsModal}
                      onClose={() => setShowActuatorsModal(false)}
                      actuators={actuators}
                      onToggle={handleToggleActuator}
                    />
                  </div>
                  {/* Autres actions rapides */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Ajouter des nutriments
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100"
                        onClick={() => setShowNutrientModal(true)}
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Remplir le réservoir du système
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100"
                        onClick={() => setShowFillReservoir(true)}
                      >
                        Remplir
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Vidanger le réservoir
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-red-600 text-red-600 rounded font-semibold bg-white hover:bg-red-50"
                        onClick={() => setShowConfirmDrain(true)}
                      >
                        Vidanger
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Vidanger le bac
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
                        <div
                          key={key}
                          className="flex flex-wrap items-center gap-4"
                        >
                          <span className="w-60 font-medium text-gray-700">
                            {PARAM_LABELS[key] || key}
                          </span>
                          <div className="flex items-center gap-1">
                            <label className="text-sm">Min</label>
                            <input
                              type="number"
                              step="any"
                              className="border rounded px-2 py-1 w-24"
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
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-sm">Max</label>
                            <input
                              type="number"
                              step="any"
                              className="border rounded px-2 py-1 w-24"
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
                        </div>
                      );
                    })}
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 self-end"
                    onClick={async () => {
                      const keyMap = keyToSensorValue as Record<
                        string,
                        { sensor_name: string; value_name: string }
                      >;

                      // Utilise la référence de l'état initial
                      const initialBornes = initialBornesRef.current || {};

                      // Filtre uniquement les bornes modifiées
                      const changedBornes = Object.entries(
                        editableBornes
                      ).filter(([key, val]) => {
                        if (!keyMap[key]) return false;
                        const initial = initialBornes[key];
                        if (!initial) return true; // Si pas d'initial, considérer comme modifié
                        return (
                          initial.min !== val.min || initial.max !== val.max
                        );
                      });

                      if (changedBornes.length === 0) {
                        alert("Aucune borne modifiée à enregistrer.");
                        return;
                      }

                      const promises = changedBornes.map(([key, val]) => {
                        const mapping = keyMap[key];
                        const payload = {
                          sensor_name: mapping.sensor_name,
                          value_name: mapping.value_name,
                          lower_limit: val.min,
                          upper_limit: val.max,
                        };
                        return fetch("/api/config/bornes", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                      });

                      const results = await Promise.allSettled(promises);
                      const successCount = results.filter(
                        (r) => r.status === "fulfilled" && r.value.ok
                      ).length;
                      const errorCount = results.length - successCount;

                      if (successCount > 0 && errorCount === 0) {
                        alert(
                          "Toutes les bornes ont été enregistrées avec succès."
                        );
                      } else if (successCount > 0 && errorCount > 0) {
                        alert(
                          `Certaines bornes ont été enregistrées, mais ${errorCount} ont échoué.`
                        );
                      } else {
                        alert("Erreur lors de l'enregistrement des bornes.");
                      }
                    }}
                  >
                    Enregistrer
                  </button>
                  <PlantBoundsCSVButtons
                    editableBornes={editableBornes}
                    setEditableBornes={setEditableBornes}
                  />
                </form>
              </div>
            </div>
            {/* ...suppression du modal d'ajout de plante... */}
            {/* InfoBox d'implémentation */}
            <InfoBox />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
