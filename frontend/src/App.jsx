import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TweetAnalysis from "./pages/TweetAnalysis";
import EarthquakeAnalysis from "./pages/EarthquakeAnalysis";
import SatelliteDamageAnalysis from "./pages/SatelliteDamageAnalysis";
import IntegratedReport from "./pages/IntegratedReport";
import History from "./pages/History";

function App() {

  useEffect(() => {
    // Tarayıcı yeniden açıldığında eski analizleri temizle
    if (!sessionStorage.getItem("sessionStarted")) {

      localStorage.removeItem("earthquakeResult");
      localStorage.removeItem("tweetResult");
      localStorage.removeItem("damageResult");

      localStorage.removeItem("finalReport");
      localStorage.removeItem("integratedReport");
      localStorage.removeItem("regionalPriorityList");

      sessionStorage.setItem("sessionStarted", "true");
    }
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/earthquake-analysis"
          element={<EarthquakeAnalysis />}
        />

        <Route
          path="/tweet-analysis"
          element={<TweetAnalysis />}
        />

        <Route
          path="/satellite-damage-analysis"
          element={<SatelliteDamageAnalysis />}
        />

        <Route
          path="/integrated-report"
          element={<IntegratedReport />}
        />

        <Route
          path="/history"
          element={<History />}
        />
      </Routes>
    </>
  );
}

export default App;