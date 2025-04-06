// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import keycloak from '../keycloak'; // Import the keycloak instance

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  // Use state to react to auth changes, although keycloak instance itself holds the state
  const [isAuthenticated, setIsAuthenticated] = useState(keycloak.authenticated);

  // Update state when auth status changes (e.g., after login/logout)
  useEffect(() => {
      const updateAuthState = () => setIsAuthenticated(keycloak.authenticated ?? false);

      keycloak.onAuthSuccess = updateAuthState;
      keycloak.onAuthLogout = updateAuthState;
      keycloak.onAuthRefreshSuccess = updateAuthState;
      keycloak.onAuthRefreshError = () => {
        console.warn("Auth refresh error, logging out");
        keycloak.logout(); // Force logout on refresh error
      };
      keycloak.onTokenExpired = () => {
        console.warn("Token expired, attempting refresh");
        keycloak.updateToken(30).catch(() => {
            console.error("Failed to refresh token, logging out");
            keycloak.logout(); // Force logout if refresh fails
        });
      };


      // Initial check
      updateAuthState();

      // Cleanup not strictly necessary here as keycloak is global, but good practice
      // if you were managing instance lifecycle differently.
      // return () => {
      //   keycloak.onAuthSuccess = undefined;
      //   // ... remove other handlers
      // };
  }, []);


  const handleLogin = () => {
    // Redirect to Keycloak login page
    keycloak.login();
  };

  const handleLogout = () => {
    // Redirect to Keycloak logout page
    alert("logout")
    keycloak.logout();
  };

  return (
    <nav style={{ background: '#eee', padding: '1rem', marginBottom: '1rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      {isAuthenticated && (
        <Link to="/protected" style={{ marginRight: '1rem' }}>Protected</Link>
      )}

      <div style={{ float: 'right' }}>
        {isAuthenticated ? (
          <button onClick={handleLogout}>Logout ({keycloak.tokenParsed?.preferred_username})</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;