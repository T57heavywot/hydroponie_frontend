import React from "react";

const InfoBox: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400 mt-6">
    <h3 className="text-lg font-medium text-yellow-800 mb-2">
      Note pour l'implémentation
    </h3>
    <div className="text-sm text-yellow-700">
      <p>
        On utilise actuellement des données simulées. Pour connecter vos
        capteurs réels, on doit:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>
          Modifier le backend (server.js) pour recevoir les données des capteurs
          physiques
        </li>
        <li>Adapter le format des données selon nos capteurs spécifiques</li>
        <li>Ajuster les plages de valeurs et les unités si besoin, à voir</li>
      </ul>
    </div>
  </div>
);

export default InfoBox;
