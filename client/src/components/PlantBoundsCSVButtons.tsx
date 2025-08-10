import React from "react";


type Bounds = { min: number; max: number };
type EditableBornesType = { [param: string]: Bounds };

interface PlantBoundsCSVButtonsProps {
  editableBornes: EditableBornesType;
  setEditableBornes: React.Dispatch<React.SetStateAction<EditableBornesType>>;
}
 

const EXCLUDED_PARAMS = ["waterLevelReservoir", "waterLevelBac"];

const PlantBoundsCSVButtons: React.FC<PlantBoundsCSVButtonsProps> = ({
  editableBornes,
  setEditableBornes,
}) => {
  // Export CSV bornes globales
  const handleExport = () => {
    const rows = ["Parameter;Min;Max"];
    Object.entries(editableBornes)
      .filter(([param]) => !EXCLUDED_PARAMS.includes(param))
      .forEach(([param, val]) => {
        rows.push(`${param};${val.min};${val.max}`);
      });
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bornes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import CSV bornes globales
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
        header.length < 3 ||
        header[0] !== "parameter" ||
        header[1] !== "min" ||
        header[2] !== "max"
      ) {
        alert("En-tête CSV invalide. Format attendu : Parameter;Min;Max");
        return;
      }
      const newBornes: any = { ...editableBornes };
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";");
        if (cols.length < 3) continue;
        const [param, min, max] = cols.map((c) => c.trim());
        if (
          !param ||
          isNaN(Number(min)) ||
          isNaN(Number(max)) ||
          EXCLUDED_PARAMS.includes(param)
        )
          continue;
        newBornes[param] = {
          min: parseFloat(min),
          max: parseFloat(max),
        };
      }
      setEditableBornes(newBornes);
      alert("Bornes importées avec succès !");
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        type="button"
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 border border-gray-400"
        onClick={handleExport}
      >
        Exporter CSV
      </button>
    </div>
  );
};

export default PlantBoundsCSVButtons;
