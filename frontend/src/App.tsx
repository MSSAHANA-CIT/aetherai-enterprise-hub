import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ComingSoonProvider } from "./context/ComingSoonContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <ComingSoonProvider>
        <RouterProvider router={router} />
      </ComingSoonProvider>
    </AuthProvider>
  );
}
