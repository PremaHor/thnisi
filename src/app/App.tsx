import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FirebaseProvider } from "./contexts/FirebaseContext";

export default function App() {
  return (
    <FirebaseProvider>
      <RouterProvider router={router} />
    </FirebaseProvider>
  );
}