// src/keycloak.ts
import Keycloak from 'keycloak-js';

// Load environment variables using Vite's import.meta.env
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM 
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID 

if (!keycloakUrl) alert("Error ENV not Set !")

// Setup Keycloak instance with environment variables
const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});


export default keycloak;