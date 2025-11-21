import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE_URL = 'https://nexusbert-multi-voice-system.hf.space';

function App() {
  const [baseUrl, setBaseUrl] = useState(API_BASE_URL);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  const updateResponse = (endpoint, data, error = null) => {
    setResponses(prev => ({
      ...prev,
      [endpoint]: { data, error, timestamp: new Date().toISOString() }
    }));
    setLoading(prev => ({ ...prev, [endpoint]: false }));
  };

  const setEndpointLoading = (endpoint, isLoading) => {
    setLoading(prev => ({ ...prev, [endpoint]: isLoading }));
  };

  // GET / - Root endpoint
  const testRoot = async () => {
    setEndpointLoading('root', true);
    try {
      const response = await axios.get(`${baseUrl}/`);
      updateResponse('root', response.data);
    } catch (error) {
      updateResponse('root', null, error.response?.data || error.message);
    }
  };

  // GET /health - Health check
  const testHealth = async () => {
    setEndpointLoading('health', true);
    try {
      const response = await axios.get(`${baseUrl}/health`);
      updateResponse('health', response.data);
    } catch (error) {
      updateResponse('health', null, error.response?.data || error.message);
    }
  };

  // POST /ask - Ask query
  const testAsk = async (query) => {
    setEndpointLoading('ask', true);
    try {
      const formData = new FormData();
      formData.append('query', query);
      const response = await axios.post(`${baseUrl}/ask`, formData);
      updateResponse('ask', response.data);
    } catch (error) {
      updateResponse('ask', null, error.response?.data || error.message);
    }
  };

  // POST /transcribe - Transcribe audio
  const testTranscribe = async (audioFile, language) => {
    setEndpointLoading('transcribe', true);
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('language', language);
      const response = await axios.post(`${baseUrl}/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateResponse('transcribe', response.data);
    } catch (error) {
      updateResponse('transcribe', null, error.response?.data || error.message);
    }
  };

  // POST /transcribe/{language} - Language-specific transcribe
  const testTranscribeLanguage = async (audioFile, language) => {
    setEndpointLoading(`transcribe_${language}`, true);
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      const response = await axios.post(`${baseUrl}/transcribe/${language}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateResponse(`transcribe_${language}`, response.data);
    } catch (error) {
      updateResponse(`transcribe_${language}`, null, error.response?.data || error.message);
    }
  };

  // POST /speak-ai - Speak AI
  const testSpeakAI = async (audioFile, language) => {
    setEndpointLoading('speak-ai', true);
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('language', language);
      const response = await axios.post(`${baseUrl}/speak-ai`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      updateResponse('speak-ai', { audioUrl, message: 'Audio generated successfully' });
    } catch (error) {
      updateResponse('speak-ai', null, error.response?.data || error.message);
    }
  };

  // POST /tts - Text to speech
  const testTTS = async (text, language, speakerName, temperature, repetitionPenalty, maxLength) => {
    setEndpointLoading('tts', true);
    try {
      const response = await axios.post(`${baseUrl}/tts`, {
        text,
        language,
        speaker_name: speakerName,
        temperature: parseFloat(temperature),
        repetition_penalty: parseFloat(repetitionPenalty),
        max_length: parseInt(maxLength)
      }, {
        responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      updateResponse('tts', { audioUrl, message: 'TTS audio generated successfully' });
    } catch (error) {
      updateResponse('tts', null, error.response?.data || error.message);
    }
  };

  // POST /tts/{language} - Language-specific TTS
  const testTTSLanguage = async (text, language, speakerName, temperature, repetitionPenalty, maxLength) => {
    setEndpointLoading(`tts_${language}`, true);
    try {
      const response = await axios.post(`${baseUrl}/tts/${language}`, {
        text,
        language,
        speaker_name: speakerName,
        temperature: parseFloat(temperature),
        repetition_penalty: parseFloat(repetitionPenalty),
        max_length: parseInt(maxLength)
      }, {
        responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      updateResponse(`tts_${language}`, { audioUrl, message: 'TTS audio generated successfully' });
    } catch (error) {
      updateResponse(`tts_${language}`, null, error.response?.data || error.message);
    }
  };

  // POST /speak - Speak
  const testSpeak = async (text, language, temperature, repetitionPenalty, maxLength) => {
    setEndpointLoading('speak', true);
    try {
      const response = await axios.post(`${baseUrl}/speak`, {
        text,
        language,
        temperature: temperature ? parseFloat(temperature) : null,
        repetition_penalty: repetitionPenalty ? parseFloat(repetitionPenalty) : null,
        max_length: maxLength ? parseInt(maxLength) : null
      }, {
        responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      updateResponse('speak', { audioUrl, message: 'Speech audio generated successfully' });
    } catch (error) {
      updateResponse('speak', null, error.response?.data || error.message);
    }
  };

  // POST /tts-stream - TTS Stream
  const testTTSStream = async (text, language, speakerName, temperature, repetitionPenalty, maxLength) => {
    setEndpointLoading('tts-stream', true);
    try {
      const response = await axios.post(`${baseUrl}/tts-stream`, {
        text,
        language,
        speaker_name: speakerName,
        temperature: parseFloat(temperature),
        repetition_penalty: parseFloat(repetitionPenalty),
        max_length: parseInt(maxLength)
      }, {
        responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      updateResponse('tts-stream', { audioUrl, message: 'Streaming TTS audio generated successfully' });
    } catch (error) {
      updateResponse('tts-stream', null, error.response?.data || error.message);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Multi Voice System API Tester</h1>
        <p>Test and interact with all FastAPI endpoints</p>
      </div>

      <div className="api-base-url">
        <label>API Base URL:</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://nexusbert-multi-voice-system.hf.space"
        />
      </div>

      {/* GET Endpoints */}
      <div className="endpoint-section">
        <h2>GET Endpoints</h2>
        
        <div className="endpoint-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="method get">GET</span>
            <span className="path">/</span>
          </div>
          <p style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.875rem' }}>Root endpoint - Get system information</p>
          <button 
            className="button" 
            onClick={testRoot}
            disabled={loading.root}
          >
            {loading.root ? 'Loading...' : 'Test Root'}
          </button>
          {responses.root && (
            <div className={`response ${responses.root.error ? 'error' : 'success'}`}>
              <h4>Response:</h4>
              <pre>{JSON.stringify(responses.root.error || responses.root.data, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="endpoint-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="method get">GET</span>
            <span className="path">/health</span>
          </div>
          <p style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.875rem' }}>Health check endpoint</p>
          <button 
            className="button" 
            onClick={testHealth}
            disabled={loading.health}
          >
            {loading.health ? 'Loading...' : 'Test Health'}
          </button>
          {responses.health && (
            <div className={`response ${responses.health.error ? 'error' : 'success'}`}>
              <h4>Response:</h4>
              <pre>{JSON.stringify(responses.health.error || responses.health.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* POST /ask */}
      <div className="endpoint-section">
        <h2>POST /ask</h2>
        <AskForm onSubmit={testAsk} response={responses.ask} loading={loading.ask} />
      </div>

      {/* POST /transcribe */}
      <div className="endpoint-section">
        <h2>POST /transcribe</h2>
        <TranscribeForm onSubmit={testTranscribe} response={responses.transcribe} loading={loading.transcribe} />
      </div>

      {/* POST /transcribe/{language} */}
      <div className="endpoint-section">
        <h2>POST /transcribe/{'{language}'}</h2>
        <TranscribeLanguageForm onSubmit={testTranscribeLanguage} response={responses} loading={loading} />
      </div>

      {/* POST /speak-ai */}
      <div className="endpoint-section">
        <h2>POST /speak-ai</h2>
        <SpeakAIForm onSubmit={testSpeakAI} response={responses['speak-ai']} loading={loading['speak-ai']} />
      </div>

      {/* POST /tts */}
      <div className="endpoint-section">
        <h2>POST /tts</h2>
        <TTSForm onSubmit={testTTS} response={responses.tts} loading={loading.tts} />
      </div>

      {/* POST /tts/{language} */}
      <div className="endpoint-section">
        <h2>POST /tts/{'{language}'}</h2>
        <TTSLanguageForm onSubmit={testTTSLanguage} response={responses} loading={loading} />
      </div>

      {/* POST /speak */}
      <div className="endpoint-section">
        <h2>POST /speak</h2>
        <SpeakForm onSubmit={testSpeak} response={responses.speak} loading={loading.speak} />
      </div>

      {/* POST /tts-stream */}
      <div className="endpoint-section">
        <h2>POST /tts-stream</h2>
        <TTSForm onSubmit={testTTSStream} response={responses['tts-stream']} loading={loading['tts-stream']} />
      </div>
    </div>
  );
}

// Ask Form Component
function AskForm({ onSubmit, response, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Query</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          required
          disabled={loading}
        />
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Loading...' : 'Test Ask'}
      </button>
      {response && (
        <div className={`response ${response.error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          <pre>{JSON.stringify(response.error || response.data, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

// Transcribe Form Component
function TranscribeForm({ onSubmit, response, loading }) {
  const [audioFile, setAudioFile] = useState(null);
  const [language, setLanguage] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (audioFile) {
      onSubmit(audioFile, language);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Language Code</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
          <option value="en">English (en)</option>
          <option value="yo">Yoruba (yo)</option>
          <option value="ig">Igbo (ig)</option>
          <option value="ha">Hausa (ha)</option>
        </select>
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Loading...' : 'Test Transcribe'}
      </button>
      {response && (
        <div className={`response ${response.error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          <pre>{JSON.stringify(response.error || response.data, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

// Transcribe Language Form Component
function TranscribeLanguageForm({ onSubmit, response, loading }) {
  const [audioFile, setAudioFile] = useState(null);
  const [language, setLanguage] = useState('english');
  const isLoading = loading[`transcribe_${language}`];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (audioFile) {
      onSubmit(audioFile, language);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          required
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isLoading}>
          <option value="english">English</option>
          <option value="yoruba">Yoruba</option>
          <option value="igbo">Igbo</option>
          <option value="hausa">Hausa</option>
        </select>
      </div>
      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? 'Loading...' : `Test Transcribe ${language}`}
      </button>
      {response[`transcribe_${language}`] && (
        <div className={`response ${response[`transcribe_${language}`].error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          <pre>{JSON.stringify(response[`transcribe_${language}`].error || response[`transcribe_${language}`].data, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

// Speak AI Form Component
function SpeakAIForm({ onSubmit, response, loading }) {
  const [audioFile, setAudioFile] = useState(null);
  const [language, setLanguage] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (audioFile) {
      onSubmit(audioFile, language);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Language Code</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
          <option value="en">English (en)</option>
          <option value="yo">Yoruba (yo)</option>
          <option value="ig">Igbo (ig)</option>
          <option value="ha">Hausa (ha)</option>
        </select>
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Loading...' : 'Test Speak AI'}
      </button>
      {response && (
        <div className={`response ${response.error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          {response.error ? (
            <pre>{JSON.stringify(response.error, null, 2)}</pre>
          ) : (
            <div>
              <p>{response.data?.message}</p>
              {response.data?.audioUrl && (
                <div className="audio-player">
                  <audio controls src={response.data.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

// TTS Form Component
function TTSForm({ onSubmit, response, loading }) {
  const [text, setText] = useState('Hello, this is a test of the text to speech system.');
  const [language, setLanguage] = useState('english');
  const [speakerName, setSpeakerName] = useState('idera');
  const [temperature, setTemperature] = useState('0.1');
  const [repetitionPenalty, setRepetitionPenalty] = useState('1.1');
  const [maxLength, setMaxLength] = useState('4000');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text, language, speakerName, temperature, repetitionPenalty, maxLength);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech"
          required
          disabled={loading}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
            <option value="english">English</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="hausa">Hausa</option>
          </select>
        </div>
        <div className="form-group">
          <label>Speaker Name</label>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="idera"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="0.1"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Repetition Penalty</label>
          <input
            type="number"
            step="0.1"
            value={repetitionPenalty}
            onChange={(e) => setRepetitionPenalty(e.target.value)}
            placeholder="1.1"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Max Length</label>
          <input
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            placeholder="4000"
            disabled={loading}
          />
        </div>
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Loading...' : 'Test TTS'}
      </button>
      {response && (
        <div className={`response ${response.error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          {response.error ? (
            <pre>{JSON.stringify(response.error, null, 2)}</pre>
          ) : (
            <div>
              <p>{response.data?.message}</p>
              {response.data?.audioUrl && (
                <div className="audio-player">
                  <audio controls src={response.data.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

// TTS Language Form Component
function TTSLanguageForm({ onSubmit, response, loading }) {
  const [text, setText] = useState('Hello, this is a test of the text to speech system.');
  const [language, setLanguage] = useState('english');
  const [speakerName, setSpeakerName] = useState('idera');
  const [temperature, setTemperature] = useState('0.1');
  const [repetitionPenalty, setRepetitionPenalty] = useState('1.1');
  const [maxLength, setMaxLength] = useState('4000');
  const isLoading = loading[`tts_${language}`];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text, language, speakerName, temperature, repetitionPenalty, maxLength);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech"
          required
          disabled={isLoading}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isLoading}>
            <option value="english">English</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="hausa">Hausa</option>
          </select>
        </div>
        <div className="form-group">
          <label>Speaker Name</label>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="idera"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="0.1"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Repetition Penalty</label>
          <input
            type="number"
            step="0.1"
            value={repetitionPenalty}
            onChange={(e) => setRepetitionPenalty(e.target.value)}
            placeholder="1.1"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Max Length</label>
          <input
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            placeholder="4000"
            disabled={isLoading}
          />
        </div>
      </div>
      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? 'Loading...' : `Test TTS ${language}`}
      </button>
      {response[`tts_${language}`] && (
        <div className={`response ${response[`tts_${language}`].error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          {response[`tts_${language}`].error ? (
            <pre>{JSON.stringify(response[`tts_${language}`].error, null, 2)}</pre>
          ) : (
            <div>
              <p>{response[`tts_${language}`].data?.message}</p>
              {response[`tts_${language}`].data?.audioUrl && (
                <div className="audio-player">
                  <audio controls src={response[`tts_${language}`].data.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

// Speak Form Component
function SpeakForm({ onSubmit, response, loading }) {
  const [text, setText] = useState('Hello, this is a test of the speak system.');
  const [language, setLanguage] = useState('english');
  const [temperature, setTemperature] = useState('');
  const [repetitionPenalty, setRepetitionPenalty] = useState('');
  const [maxLength, setMaxLength] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text, language, temperature, repetitionPenalty, maxLength);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak"
          required
          disabled={loading}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
            <option value="english">English</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="hausa">Hausa</option>
          </select>
        </div>
        <div className="form-group">
          <label>Temperature (optional)</label>
          <input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="0.1"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Repetition Penalty (optional)</label>
          <input
            type="number"
            step="0.1"
            value={repetitionPenalty}
            onChange={(e) => setRepetitionPenalty(e.target.value)}
            placeholder="1.1"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Max Length (optional)</label>
          <input
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            placeholder="4000"
            disabled={loading}
          />
        </div>
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Loading...' : 'Test Speak'}
      </button>
      {response && (
        <div className={`response ${response.error ? 'error' : 'success'}`}>
          <h4>Response:</h4>
          {response.error ? (
            <pre>{JSON.stringify(response.error, null, 2)}</pre>
          ) : (
            <div>
              <p>{response.data?.message}</p>
              {response.data?.audioUrl && (
                <div className="audio-player">
                  <audio controls src={response.data.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

export default App;

