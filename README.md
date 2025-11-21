# Multi Voice System API Tester

A React application to test all endpoints of the Multi Voice System FastAPI backend.

## Features

This app provides a comprehensive UI to test all FastAPI endpoints:

- **GET Endpoints:**
  - `GET /` - Root endpoint (system information)
  - `GET /health` - Health check

- **POST Endpoints:**
  - `POST /ask` - Ask query endpoint
  - `POST /transcribe` - Transcribe audio with language selection
  - `POST /transcribe/{language}` - Language-specific transcription (english, yoruba, igbo, hausa)
  - `POST /speak-ai` - Transcribe audio, ask AI, and generate speech
  - `POST /tts` - Text to speech conversion
  - `POST /tts/{language}` - Language-specific TTS
  - `POST /speak` - Speak endpoint
  - `POST /tts-stream` - Streaming TTS

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Configuration

The default API base URL is set to `https://nexusbert-multi-voice-system.hf.space`. You can change this in the UI by editing the "API Base URL" field at the top of the page.

## Usage

1. **Test GET Endpoints:** Click the "Test" buttons for root and health endpoints to see system information.

2. **Test POST /ask:** Enter a query and submit to test the ask endpoint.

3. **Test Transcription:** Upload an audio file and select a language code (en, yo, ig, ha) to test transcription.

4. **Test TTS:** Enter text, select language and speaker, adjust parameters, and generate speech audio.

5. **Test Speak AI:** Upload an audio file, it will be transcribed, sent to the AI, and the response will be converted to speech.

6. **Audio Playback:** All audio responses include an audio player for immediate playback.

## API Endpoints Tested

All endpoints from the FastAPI backend at https://nexusbert-multi-voice-system.hf.space are available for testing with a user-friendly interface.

