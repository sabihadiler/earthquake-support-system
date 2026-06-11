import { useState } from "react";
import API from "../api/api";

function EarthquakeAnalysis() {
  const [file, setFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2023-02-06");
  const [region, setRegion] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an earthquake dataset file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post(
      `/earthquake-analysis?selected_date=${selectedDate}&region=${region}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setResult(response.data);

    if (!response.data.message) {
      localStorage.setItem(
        "earthquakeResult",
        JSON.stringify({
          region: region || "Filtered Earthquake Region",
          magnitude: response.data.max_magnitude,
          average_magnitude: response.data.average_magnitude,
          average_depth: response.data.average_depth,
          total_earthquakes: response.data.total_earthquakes,
          affected_locations: response.data.affected_locations,
          top_risky_locations: response.data.top_risky_locations,
          earthquake_risk_level: response.data.earthquake_risk_level,
        })
      );
    }
  };

  return (
    <div className="page">
      <h1>Earthquake Dataset Analysis</h1>

      <form className="form" onSubmit={analyze}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label>Filter Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <input
          placeholder="Region / Location filter e.g. Kahramanmaras, Hatay"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />

        <button type="submit">Analyze Earthquake Dataset</button>
      </form>

      {result && result.message && (
        <div className="report low">
          <h2>No Data Found</h2>
          <p>{result.message}</p>
        </div>
      )}

      {result && !result.message && (
        <div className={`report ${result.earthquake_risk_level}`}>
          <h2>Earthquake Analysis Result</h2>

          <p>
            <b>Total Earthquakes:</b> {result.total_earthquakes}
          </p>

          <p>
            <b>Maximum Magnitude:</b> {result.max_magnitude}
          </p>

          <p>
            <b>Average Magnitude:</b> {result.average_magnitude}
          </p>

          <p>
            <b>Average Depth:</b> {result.average_depth} km
          </p>

          <p>
            <b>Earthquake Risk Level:</b> {result.earthquake_risk_level}
          </p>

          <h3>Affected Locations</h3>

          <ul>
            {result.affected_locations.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>

          {result.top_risky_locations &&
            result.top_risky_locations.length > 0 && (
              <>
                <h3>Location-Based Earthquake Ranking</h3>

                <div className="history-list">
                  {result.top_risky_locations.map((location, index) => (
                    <div className="history-card" key={index}>
                      <h4>
                        #{index + 1} {location.Location}
                      </h4>

                      <p>
                        <b>Total Earthquakes:</b>{" "}
                        {location.total_earthquakes}
                      </p>

                      <p>
                        <b>Max Magnitude:</b>{" "}
                        {Number(location.max_magnitude).toFixed(2)}
                      </p>

                      <p>
                        <b>Average Magnitude:</b>{" "}
                        {Number(location.avg_magnitude).toFixed(2)}
                      </p>

                      <p>
                        <b>Average Depth:</b>{" "}
                        {Number(location.avg_depth).toFixed(2)} km
                      </p>

                      <p>
                        <b>High Risk Count:</b> {location.high_count}
                      </p>

                      <p>
                        <b>Medium Risk Count:</b> {location.medium_count}
                      </p>

                      <p>
                        <b>Low Risk Count:</b> {location.low_count}
                      </p>

                      <p>
                        <b>Earthquake Score:</b>{" "}
                        {Number(location.final_earthquake_score).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

          <p className="summary">
            Earthquake analysis result has been saved for the Integrated Report.
          </p>
        </div>
      )}
    </div>
  );
}

export default EarthquakeAnalysis;