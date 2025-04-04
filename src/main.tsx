// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import keycloak from './keycloak.ts'; // Import the keycloak instance

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Display a loading message while Keycloak is initializing
root.render(
  <React.StrictMode>
    <div>Initializing Keycloak...</div>
    {/* You can replace this with a proper loading spinner component */}
  </React.StrictMode>
);

// --- Keycloak Initialization ---
keycloak.init({
    onLoad: 'login-required', // Can be 'login-required' or 'check-sso'
    // silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' // Optional: For smoother silent checks
    pkceMethod: 'S256' // Recommended for public clients
 })
  .then((authenticated) => {
    console.log(`Keycloak initialized. User is ${authenticated ? 'authenticated' : 'not authenticated'}.`);

    // --- Render React App ---
    // Re-render the app once Keycloak is initialized
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);
     // Render an error message if initialization fails
    root.render(
      <React.StrictMode>
        <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
          <h2>Error Initializing Keycloak</h2>
          <p>Could not connect to the authentication server. Please check the console for details and ensure Keycloak is running and configured correctly.</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </React.StrictMode>
    );
  });

// Optional: Create an empty HTML file for silent check SSO if using it
// Create public/silent-check-sso.html (leave it empty)