// src/pages/ProtectedPage.tsx
import React from 'react';
import keycloak from '../../keycloak'; // Import the keycloak instance

const ProtectedPage: React.FC = () => {
  // Example: Displaying user information from the token
  const username = keycloak.tokenParsed?.preferred_username;
  const email = keycloak.tokenParsed?.email;
  const roles = JSON.stringify(keycloak.tokenParsed?.realm_access?.roles)

  return (
    <div>
      <h1>Protected Page</h1>
      <p>If you see this, you are logged in!</p>
      {username && <p>Username: {username}</p>}
      {email && <p>Email: {email}</p>}
      {roles && <p>Roles: {roles}</p>}
      {/* You can add more logic here that requires authentication */}
      <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflowX: 'auto' }}>
        Token Parsed: {JSON.stringify(keycloak.tokenParsed, null, 2)}
      </pre>
    </div>
  );
};

export default ProtectedPage;