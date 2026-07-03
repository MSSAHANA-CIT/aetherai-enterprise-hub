import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ComingSoonProvider } from "./context/ComingSoonContext";
import DesktopOnlyGate from "./components/device/DesktopOnlyGate";
import { router } from "./routes";

export default function App() {
  return (
    <DesktopOnlyGate>
      <AuthProvider>
        <ComingSoonProvider>
          <RouterProvider router={router} />
        </ComingSoonProvider>
      </AuthProvider>
    </DesktopOnlyGate>
  );
}
