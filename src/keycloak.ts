// src/keycloak.ts
import Keycloak from 'keycloak-js';

// Load environment variables using Vite's import.meta.env
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:7777';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'viprealm';
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'vipclient';

// Setup Keycloak instance with environment variables
const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});


export default keycloak;