import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';
import { exec } from 'child_process';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Refined location extraction function
function extractLocationName(text) {
  const locationKeywords = ['Mumbai', 'Delhi', 'Brazil', 'Tokyo', 'New York', 'London']; // Add more cities or countries here
  for (const keyword of locationKeywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

app.post('/generate-kml', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    // 1. Get location info from Hugging Face
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/google/gemma-1.1-2b-it", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const hfData = await hfResponse.json();
    console.log('Hugging Face Response:', hfData);

    const fullResponse = hfData[0]?.generated_text || "No response.";
    console.log('Full AI Response:', fullResponse);

    // 2. Extract a short location string
    const location = extractLocationName(fullResponse);
    if (!location) {
      return res.status(400).json({ error: "Could not extract location from AI response." });
    }

    console.log('Extracted Location:', location);

    // 3. Geocode using OpenCage
    const geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.OPENCAGE_KEY}`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.log('GeoCoding Error:', geoData);
      return res.status(404).json({ error: "Location not found." });
    }

    const { lat, lng } = geoData.results[0].geometry;
    console.log('Geocoded Coordinates:', lat, lng);

    // 4. Generate KML
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"
     xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>Fly to ${location}</name>
    <gx:Tour>
      <name>FlyTo ${location}</name>
      <gx:Playlist>
        <gx:FlyTo>
          <gx:duration>6.0</gx:duration>
          <gx:flyToMode>smooth</gx:flyToMode>
          <LookAt>
            <longitude>${lng}</longitude>
            <latitude>${lat}</latitude>
            <altitude>0</altitude>
            <heading>0</heading>
            <tilt>45</tilt>
            <range>1000000</range>
            <altitudeMode>relativeToGround</altitudeMode>
          </LookAt>
        </gx:FlyTo>
      </gx:Playlist>
    </gx:Tour>

    <Placemark>
      <name>${location}</name>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
`;

    const kmlFilePath = './location.kml';
    
    // Delete existing KML file if present
    if (fs.existsSync(kmlFilePath)) {
      fs.unlinkSync(kmlFilePath);
    }

    // Write new KML to file
    fs.writeFileSync(kmlFilePath, kml, 'utf8');
    console.log('🗂️  KML file generated:', kmlFilePath);

    // 5. Open in Google Earth Pro (on macOS)
    const macGEPPath = '/Applications/Google Earth Pro.app/Contents/MacOS/Google Earth';
    exec(`"${macGEPPath}" "${kmlFilePath}"`, (error, stdout, stderr) => {
      if (error && !stdout.includes('OpenGL')) {
        console.error(`❌ Google Earth Pro exec error:`, error.message);
        return;
      }

      if (stderr) {
        console.log('📝 Google Earth Pro log (stderr):', stderr); // Not always an error
      }

      console.log('✅ Google Earth Pro launched successfully.');
      console.log('📤 stdout:', stdout);
    });

    res.status(200).json({ message: '✅ KML generated and launched successfully!', location });

  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
