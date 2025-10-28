import React from 'react';

export const DebugPanel: React.FC = () => {
  const testAI = async () => {
    console.log('=== DEBUG TEST START ===');
    console.log('Environment variables:', {
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'EXISTS' : 'MISSING',
      VITE_OPENAI_API_KEY_LENGTH: import.meta.env.VITE_OPENAI_API_KEY?.length || 0,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV
    });

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      alert('❌ No API key found!');
      return;
    }

    try {
      alert('🚀 Testing OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Say hello in JSON format: {\"message\": \"hello\"}"
            }
          ],
          max_tokens: 50
        })
      });

      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        alert('✅ API test successful!');
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        alert('❌ API test failed: ' + response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('❌ Network error: ' + error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'red', 
      color: 'white', 
      padding: 10, 
      borderRadius: 5,
      zIndex: 9999
    }}>
      <button onClick={testAI} style={{ color: 'white', background: 'darkred', border: 'none', padding: 5 }}>
        🧪 Test AI
      </button>
    </div>
  );
};