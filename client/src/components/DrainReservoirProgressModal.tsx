import React from "react";

interface DrainReservoirProgressModalProps {
  show: boolean;
  onClose: () => void;
  onDone: () => void;
}

const DrainReservoirProgressModal: React.FC<DrainReservoirProgressModalProps> = ({ show, onClose, onDone }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-2">Vidange du réservoir</h2>
        <p className="mb-4">La vidange du réservoir est en cours.<br />Cliquez sur "Terminé" une fois la vidange effectuée.</p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={onDone}
        >
          Terminé
        </button>
      </div>
    </div>
  );
};

export default DrainReservoirProgressModal;
