import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FirebaseProvider>
          <RouterProvider router={router} />
        </FirebaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}