import React from "react";

interface PlantBoundsCSVButtonsProps {
  plantBornes: any;
  setPlantBornes: React.Dispatch<any>;
  selectedPlant: string;
  setEditableBornes: React.Dispatch<any>;
}

const EXCLUDED_PARAMS = ["waterLevelReservoir", "waterLevelBac"];

const PlantBoundsCSVButtons: React.FC<PlantBoundsCSVButtonsProps> = ({
  plantBornes,
  setPlantBornes,
  selectedPlant,
  setEditableBornes,
}) => {
  // Export CSV
  const handleExport = () => {
    const rows = ["Plant;Parameter;Min;Max"];
    Object.entries(plantBornes).forEach(([plant, params]) => {
      Object.entries(params as { [key: string]: { min: number; max: number } })
        .filter(([param]) => !EXCLUDED_PARAMS.includes(param))
        .forEach(([param, val]) => {
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

  // Import CSV
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target?.result as string;
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert("Le fichier CSV est vide ou mal formaté.");
        return;
      }
      const header = lines[0].split(";").map((h) => h.trim().toLowerCase());
      if (
        header.length < 4 ||
        header[0] !== "plant" ||
        !header[1].startsWith("param")
      ) {
        alert("En-tête CSV invalide. Format attendu : Plant;Parameter;Min;Max");
        return;
      }
      const newPlantBornes: any = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";");
        if (cols.length < 4) continue;
        const [plant, param, min, max] = cols.map((c) => c.trim());
        if (
          !plant ||
          !param ||
          isNaN(Number(min)) ||
          isNaN(Number(max)) ||
          EXCLUDED_PARAMS.includes(param)
        )
          continue;
        if (!newPlantBornes[plant]) newPlantBornes[plant] = {};
        newPlantBornes[plant][param] = {
          min: parseFloat(min),
          max: parseFloat(max),
        };
      }
      if (Object.keys(newPlantBornes).length === 0) {
        alert("Aucune donnée valide trouvée dans le CSV.");
        return;
      }
      setPlantBornes((prev: any) => ({ ...prev, ...newPlantBornes }));
      if (selectedPlant && newPlantBornes[selectedPlant]) {
        setEditableBornes({ ...newPlantBornes[selectedPlant] });
      }
      alert("Importation réussie ! Les bornes ont été mises à jour.");
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  return (
    <div className="flex gap-4 mt-6 justify-end">
      <button
        className="px-4 py-2 bg-green-100 text-green-800 border border-green-600 rounded font-semibold hover:bg-green-200"
        onClick={handleExport}
      >
        Exporter la configuration en CSV
      </button>
      <label className="px-4 py-2 bg-white text-blue-800 border border-blue-600 rounded font-semibold hover:bg-blue-50 cursor-pointer">
        Importer un CSV configuration
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
        />
      </label>
    </div>
  );
};

export default PlantBoundsCSVButtons;
