// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import PublicPage from './pages/public/PublicPage';
import ProtectedPage from './pages/private/PrivatePage';
import ProtectedRoute from './components/ProtectedRoute'; // Import the guard
import './App.css'; // Or your preferred styling entry point

function App() {
  return (
    <BrowserRouter>
      <Navbar /> {/* Render Navbar on all pages */}
      <div style={{ padding: '1rem' }}> {/* Add some padding for content */}
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<PublicPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
            <Route path="/protected" element={<ProtectedPage />} />
            {/* Add other protected routes here */}
            {/* e.g., <Route path="/admin" element={<AdminPage />} /> */}
          </Route>

          {/* Optional: Not Found Route */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;