let apiKey = '';  // Variable to store the API key
let isSpeechPaused = false;
let speechSynthesisInstance = null;
const API_BASE_URL = 'http://localhost:3001'; // Default to localhost
document.getElementById('settingsModal').style.display = 'none'; // Hide the API Key Modal initially

// Handle asking the AI model and generating a response
async function handleAsk() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) return;

  if (!apiKey) {
    alert('Please set the API key!');
    return;
  }

  document.getElementById('loader').style.display = 'inline-block';

  try {
    const response = await fetch(`${API_BASE_URL}/generate-kml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,  // Include API key if necessary
      },
      body: JSON.stringify({ prompt: userInput }),
    });

    const data = await response.json();
    document.getElementById('loader').style.display = 'none'; // Hide loader after response

    if (data.reply) {
      document.getElementById('responseBox').innerHTML = data.reply;
      speakResponse();  // Read aloud the response
    } else {
      console.log('Received data:', data);
      document.getElementById('responseBox').innerHTML = "Sorry, I couldn't find the information.";
    }

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('loader').style.display = 'none'; // Hide loader if error occurs
    document.getElementById('responseBox').innerHTML = "Something went wrong. Please try again later.";
  }
}

// Function to speak the AI response
function speakResponse() {
  const responseText = document.getElementById('responseBox').innerText;

  if (!responseText) return;

  if (isSpeechPaused && speechSynthesisInstance) {
    speechSynthesisInstance.resume();
    isSpeechPaused = false;
    return;
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  speechSynthesisInstance = new SpeechSynthesisUtterance(responseText);
  window.speechSynthesis.speak(speechSynthesisInstance);
}

// Function to toggle pause/resume for speech
function togglePausePlay() {
  if (speechSynthesis.speaking && !isSpeechPaused) {
    speechSynthesis.pause();
    isSpeechPaused = true;
  } else if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isSpeechPaused = false;
  }
}

// Function to fetch KML data
async function fetchKML(prompt) {
  const response = await fetch(`${API_BASE_URL}/generate-kml`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  return response.text();
}

// Function to show location on Liquid Galaxy via KML
function showOnLG() {
  const responseText = document.getElementById('responseBox').innerText;
  if (!responseText) return;

  fetchKML("Take me to Tokyo")
    .then(kml => {
      console.log(kml); // Handle KML as needed
    })
    .catch(error => console.error('Error:', error));
}

// Parse/Extract the response for coordinates (adjust this to fit the model's response)
function parseCoordinates(responseText) {
  console.log("Parsing response text:", responseText);

  if (!responseText || !responseText.match(/-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?/)) {
    console.error("Invalid response format. Coordinates not found.");
    return { latitude: "0", longitude: "0" };
  }

  const coordinates = responseText.split(',').map(coord => coord.trim());
  return {
    latitude: parseFloat(coordinates[0]) || 0,
    longitude: parseFloat(coordinates[1]) || 0
  };
}

// Function to open the settings modal
function openSettings() {
  document.getElementById('settingsModal').style.display = 'block';
}

// Function to close the settings modal
function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

// Function to save the API key
function saveApiKey() {
  apiKey = document.getElementById('apiKeyInput').value;
  closeSettings();
  alert('API Key saved!');
}
