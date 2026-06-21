import { BrowserRouter, Routes, Route } from "react-router";
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import Layout from "./app/layout.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import Alarms from "@/pages/alarms"
import Settings from "@/pages/settings"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <ThemeProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Alle hier drunter liegenden Routen werden IM Layout gerendert */}
            <Route path="/" element={<App />} />
            <Route path="/alarms" element={<Alarms />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </StrictMode>
  </BrowserRouter>
)