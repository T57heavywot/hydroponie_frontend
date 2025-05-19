const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes pour les données des capteurs
app.get('/api/sensors/data', (req, res) => {
  const { hours = 6 } = req.query;
  const parsedHours = parseInt(hours, 10);

  if (isNaN(parsedHours) || parsedHours < 0) {
    return res.status(400).json({ error: 'Invalid hours parameter' });
  }

  const sensorData = generateMockData(parsedHours);
  res.json(sensorData);
});

// Route pour obtenir le niveau d'eau
app.get('/api/water-level', (req, res) => {
  // Données mockées pour le niveau d'eau (pourcentage)
  const waterLevel = Math.floor(Math.random() * 100);
  res.json({ level: waterLevel });
});

// Fonction pour générer des données mockées
function generateMockData(hours) {
  const now = new Date();
  const data = [];

  // Générer des points de données pour chaque heure demandée
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 20 + Math.random() * 5, // Entre 20°C et 25°C
      humidity: 40 + Math.random() * 20, // Entre 40% et 60%
      lightLevel: 500 + Math.random() * 300, // Entre 500 et 800 lux
      nutrients: {
        nitrogen: 200 + Math.random() * 100, // PPM
        phosphorus: 50 + Math.random() * 30,
        potassium: 150 + Math.random() * 50,
      },
      ph: 5.5 + Math.random() * 2, // Entre 5.5 et 7.5
      ec: 1.2 + Math.random() * 0.6, // Conductivité électrique en mS/cm
    });
  }

  return data;
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});