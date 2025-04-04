// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import keycloak from '../keycloak'; // Import the keycloak instance

interface ProtectedRouteProps {
  // You can add specific role checks here if needed
  // roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (/* { roles } */) => {
  const isAuthenticated = keycloak.authenticated;

  if (!isAuthenticated) {
    // Option 1: Redirect to login immediately (can cause loops if Keycloak init isn't done)
    // keycloak.login(); // Better handled by onLoad:'login-required' or in Navbar
    // return <div>Redirecting to login...</div>;

    // Option 2: Show an unauthorized message or redirect to home/login page via React Router
     console.warn("User is not authenticated. Redirecting to Home.");
     // return <Navigate to="/" replace />; // Redirect to home
     // Or show a message:
      return (
         <div>
            <h2>Unauthorized</h2>
            <p>You need to log in to access this page.</p>
            {/* Optionally add a login button */}
            {/* <button onClick={() => keycloak.login()}>Login</button> */}
         </div>
      );

  }

  // Optional: Role checking
  // if (roles && roles.length > 0) {
  //   const hasAllRoles = roles.every(role => keycloak.hasRealmRole(role));
  //   if (!hasAllRoles) {
  //     console.warn(`User does not have required roles: ${roles.join(', ')}`);
  //     return (
  //        <div>
  //           <h2>Forbidden</h2>
  //           <p>You do not have the necessary permissions to access this page.</p>
  //        </div>
  //     )
  //   }
  // }


  // If authenticated (and has roles, if checked), render the child routes/component
  return <Outlet />;
};

export default ProtectedRoute;