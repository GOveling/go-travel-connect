import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import SecurityErrorBoundary from "@/components/ui/SecurityErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <SecurityErrorBoundary>
    <App />
  </SecurityErrorBoundary>
);

