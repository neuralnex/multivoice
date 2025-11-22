import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE_URL = 'https://nexusbert-multi-voice-system.hf.space';

function App() {
  const [baseUrl, setBaseUrl] = useState(API_BASE_URL);
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, type, audioUrl = null, transcription = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      type, // 'user', 'transcription', 'tts', 'error'
      audioUrl,
      transcription,
      timestamp: new Date(),
      language: selectedLanguage
    }]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Try to use mimeType that's supported
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      addMessage('Error accessing microphone. Please allow microphone permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioSubmit = async (audioBlob) => {
    setIsProcessing(true);
    const audioUrl = URL.createObjectURL(audioBlob);
    addMessage('🎤 Voice note', 'user', audioUrl);

    try {
      const formData = new FormData();
      // Use a generic filename - backend should handle format conversion
      const filename = audioBlob.type.includes('webm') ? 'recording.webm' : 
                      audioBlob.type.includes('mp4') ? 'recording.m4a' : 
                      'recording.ogg';
      formData.append('audio_file', audioBlob, filename);

      // Transcribe using language-specific endpoint
      const transcribeResponse = await axios.post(
        `${baseUrl}/transcribe/${selectedLanguage}`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000 // 60 second timeout for transcription
        }
      );

      const transcription = transcribeResponse.data.transcription || 
                           transcribeResponse.data.text || 
                           '';
      
      if (transcription && transcription.trim()) {
        addMessage(transcription, 'transcription');
        
        // Generate TTS response
        const ttsResponse = await axios.post(
          `${baseUrl}/tts/${selectedLanguage}`,
          {
            text: transcription,
            language: selectedLanguage,
            speaker_name: getDefaultSpeaker(selectedLanguage),
            temperature: 0.1,
            repetition_penalty: 1.1,
            max_length: 4000
          },
          { 
            responseType: 'blob',
            timeout: 60000 // 60 second timeout for TTS
          }
        );

        const responseAudioUrl = URL.createObjectURL(ttsResponse.data);
        addMessage('Response', 'tts', responseAudioUrl, transcription);
      } else {
        addMessage('No transcription received. Please try speaking more clearly.', 'error');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'An error occurred while processing your voice note';
      addMessage(`Error: ${errorMsg}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDefaultSpeaker = (lang) => {
    const speakers = {
      'english': 'idera',
      'yoruba': 'yoruba_male2',
      'igbo': 'igbo_male2',
      'hausa': 'hausa_female1'
    };
    return speakers[lang] || 'idera';
  };

  const sendTextMessage = async (text) => {
    if (!text.trim()) return;

    addMessage(text, 'user');
    setIsProcessing(true);

    try {
      const ttsResponse = await axios.post(
        `${baseUrl}/tts/${selectedLanguage}`,
        {
          text: text,
          language: selectedLanguage,
          speaker_name: getDefaultSpeaker(selectedLanguage),
          temperature: 0.1,
          repetition_penalty: 1.1,
          max_length: 4000
        },
        { responseType: 'blob' }
      );

      const audioUrl = URL.createObjectURL(ttsResponse.data);
      addMessage('TTS generated', 'tts', audioUrl, text);
    } catch (error) {
      addMessage(
        `Error: ${error.response?.data?.detail || error.message}`,
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <h1>Multi Voice System</h1>
            <div className="language-selector">
              <label>Language:</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isProcessing || isRecording}
              >
                <option value="english">English</option>
                <option value="yoruba">Yoruba</option>
                <option value="igbo">Igbo</option>
                <option value="hausa">Hausa</option>
              </select>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎤</div>
              <h2>Start a conversation</h2>
              <p>Record a voice note or type a message to get started</p>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isProcessing && (
            <div className="message-bubble system">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-container">
            <input
              type="text"
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={isProcessing || isRecording}
            />
            <button
              className="send-button"
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                sendTextMessage(input.value);
                input.value = '';
              }}
              disabled={isProcessing || isRecording}
            >
              ➤
            </button>
          </div>
          
          <div className="voice-controls">
            <button
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!isProcessing) startRecording();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                if (isRecording) stopRecording();
              }}
              onMouseLeave={(e) => {
                if (isRecording) {
                  e.preventDefault();
                  stopRecording();
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (!isProcessing) startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (isRecording) stopRecording();
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                if (isRecording) stopRecording();
              }}
              disabled={isProcessing}
              type="button"
            >
              {isRecording ? (
                <>
                  <span className="pulse"></span>
                  <span>Release to send</span>
                </>
              ) : (
                <>
                  <span className="mic-icon">🎤</span>
                  <span>Hold to record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message-bubble ${message.type}`}>
      {message.type === 'user' && message.audioUrl && (
        <div className="voice-note user-voice">
          <button className="play-button" onClick={handlePlay} type="button">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="voice-info">
            <span className="voice-label">{message.text || 'Voice note'}</span>
            <span className="voice-time">{formatTime(message.timestamp)}</span>
          </div>
          <audio
            ref={audioRef}
            src={message.audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {message.type === 'transcription' && (
        <div className="transcription-bubble">
          <div className="transcription-header">
            <span className="transcription-icon">📝</span>
            <span>Transcription</span>
          </div>
          <p>{message.text}</p>
        </div>
      )}

      {message.type === 'tts' && message.audioUrl && (
        <div className="tts-bubble">
          <div className="tts-header">
            <span className="tts-icon">🔊</span>
            <span>Response</span>
          </div>
          {message.transcription && (
            <p className="tts-text">{message.transcription}</p>
          )}
          <div className="audio-player-bubble">
            <button className="play-button" onClick={handlePlay} type="button">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="audio-info">
              <span>Audio response</span>
              <span className="audio-time">{formatTime(message.timestamp)}</span>
            </div>
            <audio
              ref={audioRef}
              src={message.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {message.type === 'error' && (
        <div className="error-bubble">
          <span className="error-icon">⚠️</span>
          <span>{message.text}</span>
        </div>
      )}

      {message.type === 'user' && !message.audioUrl && (
        <div className="text-message">
          <p>{message.text}</p>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
      )}
    </div>
  );
}

export default App;
