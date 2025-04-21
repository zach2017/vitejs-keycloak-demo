Below is a static example that uses `keycloak-js` for authentication in a React application with `react-router-dom`, incorporating `HydrateRoute` for server-side rendering (SSR) as requested. The setup routes to a protected page (`/dashboard`) if the user is authenticated (`isAuthenticated` is `true` in the context), while public routes (`/` and `/login`) are accessible to all users. This example builds on your previous request, replacing the mock authentication with `keycloak-js` for real authentication via Keycloak.

### Overview

- **Keycloak-js**: A client-side JavaScript library for integrating Keycloak authentication, handling login, logout, and token management.
- **HydrateRoute**: Marks the `/dashboard` route for hydration in an SSR context, ensuring proper rendering during client-side hydration.
- **Authentication**: Uses `keycloak-js` to manage authentication state, replacing the previous `AuthContext` mock.
- **Routes**:
  - Public: `/` (Home) and `/login` (Login).
  - Protected: `/dashboard` (Dashboard), accessible only if authenticated, marked with `HydrateRoute`.
- **Context**: A `KeycloakContext` provides the Keycloak instance and authentication state to components.

### Prerequisites

1. **Keycloak Server**:
   - A running Keycloak instance (e.g., `http://localhost:8080`).
   - A realm (e.g., `myrealm`) and a public client (e.g., `myapp`) configured in the Keycloak Admin Console.
   - Client settings:
     - **Client Authentication**: Off (public client).
     - **Valid Redirect URIs**: `http://localhost:3000/*` (or specific routes like `/dashboard`).
     - **Web Origins**: `http://localhost:3000` (to allow CORS).
   - See [Keycloak JavaScript Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter) for setup details.[](https://www.keycloak.org/securing-apps/javascript-adapter)

2. **Dependencies**:
   - Install required packages:
     ```bash
     npm install react-router-dom keycloak-js
     ```

3. **SSR Setup**:
   - This example assumes an SSR setup (e.g., Vite SSR or Remix). `HydrateRoute` requires SSR for its functionality, but the code works client-side if SSR is not used.

### Code Example

#### 1. **Keycloak Context**

Create a context to manage the Keycloak instance and authentication state.

```jsx
```jsx
// src/context/KeycloakContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      const kc = new Keycloak({
        url: "http://localhost:8080", // Your Keycloak server URL
        realm: "myrealm", // Your realm
        clientId: "myapp", // Your client ID
      });

      try {
        await kc.init({
          onLoad: "check-sso", // Check SSO without forcing login
          checkLoginIframe: false, // Disable iframe for simplicity
          pkceMethod: "S256", // Enable PKCE for security
        });
        setKeycloak(kc);
        setIsAuthenticated(kc.authenticated);
        setIsInitialized(true);
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        setIsInitialized(true); // Mark as initialized even on error
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: "http://localhost:3000" });
    }
  };

  return (
    <KeycloakContext.Provider
      value={{ keycloak, isAuthenticated, isInitialized, login, logout }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);
```
```

**Notes**:
- The Keycloak instance is initialized with `check-sso`, which authenticates the user if they have an active SSO session without forcing a login.
- `pkceMethod: "S256"` enables Proof Key for Code Exchange (PKCE) for secure public client authentication.[](https://www.reddit.com/r/KeyCloak/comments/1dstul1/using_keycloak_to_authenticate_in_a_react/)
- The `logout` function redirects to the home page (`/`) after logging out.

#### 2. **Protected Route Component**

The `ProtectedRoute` component checks if the user is authenticated using the `KeycloakContext`. If not, it redirects to `/login`.

```jsx
```jsx
// src/components/ProtectedRoute.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useKeycloak } from "../context/KeycloakContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useKeycloak();
  const location = useLocation();

  if (!isInitialized) {
    return <div>Loading...</div>; // Show loading until Keycloak initializes
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```
```

**Notes**:
- Checks `isInitialized` to prevent rendering before Keycloak is ready.
- Redirects to `/login` if `isAuthenticated` is `false`, preserving the original URL in `location.state`.

#### 3. **Page Components**

Create components for the public and protected pages.

```jsx
```jsx
// src/pages/Home.jsx
const Home = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>This is a public page accessible to everyone.</p>
    </div>
  );
};

export default Home;
```
```

```jsx
```jsx
// src/pages/Login.jsx
import { useKeycloak } from "../context/KeycloakContext";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const { login, isAuthenticated, isInitialized } = useKeycloak();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  const handleLogin = () => {
    login(); // Redirects to Keycloak login page
  };

  if (isAuthenticated) {
    // Redirect to the original route or default to /dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Log In with Keycloak</button>
    </div>
  );
};

export default Login;
```
```

```jsx
```jsx
// src/pages/Dashboard.jsx
import { useKeycloak } from "../context/KeycloakContext";

const Dashboard = () => {
  const { keycloak, logout } = useKeycloak();
  const userName = keycloak?.tokenParsed?.preferred_username || "User";

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {userName}! This is a protected page.</p>
      <button onClick={logout}>Log Out</button>
    </div>
  );
};

export default Dashboard;
```
```

**Notes**:
- The `Login` page triggers Keycloak’s login flow via `keycloak.login()`.
- The `Dashboard` page displays the user’s `preferred_username` from the Keycloak token.
- If authenticated, `Login` redirects to the original route or `/dashboard`.

#### 4. **Router with `HydrateRoute`**

Define routes using `createBrowserRouter`, marking the `/dashboard` route with `HydrateRoute: true` for SSR hydration.

```jsx
```jsx
// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // Default route (/)
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
            HydrateRoute: true, // Mark for SSR hydration
          },
        ],
      },
    ],
  },
]);

export default router;
```
```

**Notes**:
- `HydrateRoute: true` ensures the `/dashboard` route is hydrated during SSR, reconciling server-rendered HTML with the client-side app.
- The `/` and `/login` routes are public and not marked with `HydrateRoute` (optional for public routes).

#### 5. **Main App Component**

The `App` component provides a layout with navigation and renders child routes.

```jsx
```jsx
// src/App.jsx
import { Outlet, Link } from "react-router-dom";
import { useKeycloak } from "./context/KeycloakContext";

const App = () => {
  const { isAuthenticated } = useKeycloak();

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
};

export default App;
```
```

#### 6. **Render the App**

Wrap the app with `KeycloakProvider` and use `RouterProvider` with `hydrateRoot` for SSR hydration.

```jsx
```jsx
// src/main.jsx
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { KeycloakProvider } from "./context/KeycloakContext";
import router from "./router";

hydrateRoot(
  document.getElementById("root"),
  <KeycloakProvider>
    <RouterProvider router={router} />
  </KeycloakProvider>
);
```
```

**Notes**:
- Use `hydrateRoot` for SSR. For client-side rendering, replace with `ReactDOM.createRoot` and `render`.
- Ensure the Keycloak server is running and configured correctly.

#### 7. **Basic CSS (Optional)**

Add styling for better presentation.

```css
```css
/* src/index.css */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 20px;
}

nav a {
  text-decoration: none;
  color: #007bff;
}

nav a:hover {
  text-decoration: underline;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
```
```

#### 8. **Optional SSR Server Setup**

For `HydrateRoute` to work, you need an SSR setup. Here’s a minimal Vite SSR server using Express.

```javascript
```javascript
// server.js
import express from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./src/App";
import { KeycloakProvider } from "./src/context/KeycloakContext";

const app = express();

app.use(express.static("dist"));

app.get("*", (req, res) => {
  const html = renderToString(
    <StaticRouter location={req.url}>
      <KeycloakProvider>
        <App />
      </KeycloakProvider>
    </StaticRouter>
  );

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR with Keycloak</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```
```

**Vite Config**:

```javascript
```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
```
```

**Run the SSR App**:
1. Build the client: `npm run build`.
2. Start the server: `node server.js`.

### How It Works

1. **Keycloak Initialization**:
   - The `KeycloakProvider` initializes `keycloak-js` with your Keycloak server details.
   - `check-sso` checks for an existing SSO session without forcing login.
   - Sets `isAuthenticated` based on `keycloak.authenticated`.

2. **Public Routes**:
   - `/` (Home) and `/login` (Login) are accessible to all users.
   - The `Login` page triggers Keycloak’s login flow if the user is not authenticated.

3. **Protected Route**:
   - `/dashboard` is nested under `ProtectedRoute`.
   - If `isAuthenticated` is `false`, redirects to `/login`.
   - If `isAuthenticated` is `true`, renders the `Dashboard` component.
   - `HydrateRoute: true` ensures `/dashboard` is hydrated during SSR.

4. **Authentication Flow**:
   - On `/login`, clicking "Log In with Keycloak" redirects to the Keycloak login page.
   - After successful login, Keycloak redirects back to the app (e.g., `/dashboard` or the original route).
   - The `Dashboard` page allows logging out, which clears the session and redirects to `/`.

5. **SSR with HydrateRoute**:
   - The server renders the initial HTML (e.g., for `/dashboard` if authenticated server-side).
   - The client uses `hydrateRoot` to hydrate the app, and `HydrateRoute` ensures `/dashboard` is reconciled correctly.

### Example Behavior

- **Initial State**: User is not authenticated.
  - `/` shows the `Home` page.
  - `/login` shows the `Login` page with a "Log In with Keycloak" button.
  - `/dashboard` redirects to `/login`.
- **After Login**:
  - Click "Log In with Keycloak" on `/login`.
  - Redirects to Keycloak’s login page.
  - After login, redirects to `/dashboard` (or original route).
  - `Dashboard` shows the user’s username and a logout button.
- **After Logout**:
  - Click "Log Out" on `/dashboard`.
  - Redirects to `/` (home page).
  - `/dashboard` redirects to `/login` again.
- **SSR**:
  - If the server renders `/dashboard` (and the user is authenticated server-side), `HydrateRoute` ensures proper client-side hydration.

### Folder Structure

```
src/
├── context/
│   └── KeycloakContext.jsx
├── components/
│   └── ProtectedRoute.jsx
├── pages/
│   └── Home.jsx
│   └── Login.jsx
│   └── Dashboard.jsx
├── App.jsx
├── router.jsx
├── main.jsx
├── index.css
server.js (optional, for SSR)
vite.config.js (optional, for SSR)
```

### Notes

- **Keycloak Configuration**:
  - Ensure the Keycloak client is public (`Client Authentication: Off`) and has correct redirect URIs (`http://localhost:3000/*`) and web origins (`http://localhost:3000`).[](https://www.keycloak.org/securing-apps/javascript-adapter)
  - Use environment variables for sensitive data (e.g., `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`) in a real app, as shown in our prior conversations (April 4, 2025).

- **HydrateRoute**:
  - Only effective in SSR setups. Without SSR, it’s ignored but doesn’t break the app.
  - For production SSR, use a framework like Vite SSR, Remix, or Next.js.

- **Security**:
  - This is a client-side authentication example. Always validate tokens server-side for protected APIs.[](https://www.keycloak.org/docs/25.0.6/securing_apps/index.html)
  - Use PKCE (`pkceMethod: "S256"`) for public clients to enhance security.[](https://www.reddit.com/r/KeyCloak/comments/1dstul1/using_keycloak_to_authenticate_in_a_react/)

- **Error Handling**:
  - The example logs initialization errors. For production, integrate with an error reporting tool like Sentry, as discussed previously (April 6, 2025).
  - Handle Keycloak errors (e.g., `error=temporarily_unavailable`) by retrying authentication, as noted in the Keycloak docs.[](https://www.keycloak.org/docs/25.0.6/securing_apps/index.html)

- **TypeScript**:
  - The code is JavaScript but can be adapted for TypeScript by adding types for `keycloak-js` and context values, as mentioned in our prior conversations (April 7, 2025).

- **Real-World Integration**:
  - For a Remix app, you could combine this with `remix-auth-keycloak`, as discussed on April 7, 2025, using `KeycloakStrategy` for server-side authentication.
  - For user profile data, extend `Dashboard.jsx` to fetch additional details from Keycloak’s `keycloak.tokenParsed` or userinfo endpoint, as shown in our April 2, 2025 conversation.

### Example with Environment Variables

To make the Keycloak configuration dynamic, use a `.env` file (as discussed on April 4, 2025):

```jsx
```jsx
// src/context/KeycloakContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      const kc = new Keycloak({
        url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
        realm: import.meta.env.VITE_KEYCLOAK_REALM || "myrealm",
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "myapp",
      });

      try {
        await kc.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
          pkceMethod: "S256",
        });
        setKeycloak(kc);
        setIsAuthenticated(kc.authenticated);
        setIsInitialized(true);
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        setIsInitialized(true);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: "http://localhost:3000" });
    }
  };

  return (
    <KeycloakContext.Provider
      value={{ keycloak, isAuthenticated, isInitialized, login, logout }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);
```
```

**.env**:

```
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=myrealm
VITE_KEYCLOAK_CLIENT_ID=myapp
```

**Vite Config Update**:

```javascript
```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  envPrefix: "VITE_", // Ensure Vite loads .env variables
});
```
```

### Troubleshooting

- **Invalid Redirect URI**:
  - Ensure `http://localhost:3000/*` is in Keycloak’s client `Valid Redirect URIs`. For specific routes, use `http://localhost:3000/dashboard` or `http://localhost:3000/callback` (April 6, 2025).[](https://www.keycloak.org/securing-apps/javascript-adapter)
  - Test the redirect flow and check browser console for CORS or redirect errors.

- **Keycloak Initialization Fails**:
  - Verify Keycloak server URL, realm, and client ID.
  - Check network connectivity to `http://localhost:8080`.
  - Ensure the client is public and PKCE is enabled.

- **SSR Issues**:
  - Ensure `hydrateRoot` is used client-side and the server renders matching HTML.
  - For Remix, integrate `remix-auth-keycloak` for server-side auth, as discussed on April 7, 2025.

### Conclusion

This example integrates `keycloak-js` for authentication in a React app with `react-router-dom`, using `HydrateRoute` for SSR. It replaces the mock `AuthContext` with Keycloak-based authentication, ensuring protected routes like `/dashboard` are only accessible to authenticated users. The setup is flexible and can be extended with environment variables, TypeScript, or Remix, as per our prior conversations.

For further details, see the [Keycloak JavaScript Adapter documentation](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter) or let me know if you need specific adjustments (e.g., Remix integration, TypeScript, or additional Keycloak features like token refresh).[](https://www.keycloak.org/securing-apps/javascript-adapter)
