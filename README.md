
# Location-based AI Interaction and Visualization with Google Earth Pro

This project allows users to interact with an AI to get location-specific details and visualize the location in Google Earth Pro. The backend service uses OpenCage geocoding API, Hugging Face’s Gemma model, and Google Earth Pro for visualization. It generates KML files based on AI-generated responses and opens them in Google Earth Pro for 3D visualization of locations.

## Features

- **Location-Based Interaction**: Ask the AI to take you to any location (e.g., "Take me to Mumbai") and get an interactive KML file that shows the location in Google Earth Pro.
- **Geospatial Visualization**: Uses KML (Keyhole Markup Language) to visualize geographical data in Google Earth Pro.
- **AI Integration**: Uses Hugging Face API for generating natural language responses based on the user input.
- **Dynamic Geocoding**: Uses the OpenCage API to translate location names into geographical coordinates.

## Requirements

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 14.x)
- [Google Earth Pro](https://www.google.com/earth/versions/#earth-pro) installed on your system.
- API Key for OpenCage and Hugging Face.
  - You can get the OpenCage API Key [here](https://opencagedata.com/).
  - You can get the Hugging Face API Token [here](https://huggingface.co/docs/hub/security-tokens).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory of the project with the following content:

   ```
   HF_TOKEN=your_huggingface_api_token
   OPENCAGE_KEY=your_opencage_api_key
   ```

4. Run the server:

   ```bash
   node server.mjs
   ```

   The backend server will run on `http://localhost:3001`.

### Usage

#### Location-Based Queries

   You can ask the AI to take you to a location, such as:

   ```
   "Take me to Mumbai"
   ```

   The AI will process the request, fetch the location details, and generate a KML file for visualization in Google Earth Pro. The generated KML file is to be opened in Google Earth Pro manually by the user.

#### Example API Request

- **Request Type**: POST
- **URL**: `http://localhost:3001/generate-kml`
- **Body**:
  ```json
  {
    "prompt": "Take me to Mumbai"
  }
  ```

  The server will return a JSON response with the generated KML file path and status.

#### Example Response

```json
{
  "message": "KML generated and launched successfully!",
  "location": "Mumbai"
}
```

### Google Earth Pro

Once the KML file is generated, the user can manually open the file in Google Earth Pro to visually explore the location. Ensure that Google Earth Pro is installed and correctly set up on your system.


### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
