import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <RouterProvider router={router} />
      </FirebaseProvider>
    </ThemeProvider>
  );
}