import { useState } from "react";
import API from "../api/api";

function SatelliteDamageAnalysis() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a ZIP file containing satellite images.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post(
      "/satellite-damage-analysis",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setResult(response.data);

    localStorage.setItem(
      "damageResult",
      JSON.stringify({
        damage_ratio: response.data.damage_ratio,
        damage_level: response.data.damage_level,
        total_images: response.data.total_images,
        damaged_count: response.data.damaged_count,
        undamaged_count: response.data.undamaged_count,
        image_name: "Satellite image ZIP dataset"
      })
    );
  };

  return (
    <div className="page">
      <h1>Satellite Damage Analysis</h1>

      <form className="form" onSubmit={analyze}>
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">Analyze Satellite ZIP Dataset</button>
      </form>

      {result && (
        <div className={`report ${result.damage_level}`}>
          <h2>Satellite Damage Result Saved</h2>

          <p><b>Total Images:</b> {result.total_images}</p>
          <p><b>Damaged Images:</b> {result.damaged_count}</p>
          <p><b>Undamaged Images:</b> {result.undamaged_count}</p>
          <p><b>Damage Ratio:</b> {result.damage_ratio}%</p>
          <p><b>Damage Level:</b> {result.damage_level}</p>
          <p>{result.message}</p>

          <h3>Sample Predictions</h3>

          {result.sample_predictions?.length > 0 ? (
            <div className="history-list">
              {result.sample_predictions.map((item, index) => (
                <div className="history-card" key={index}>
                  <p><b>File:</b> {item.file_name}</p>
                  <p><b>Prediction:</b> {item.prediction}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No image prediction found.</p>
          )}

          <p className="summary">
            Satellite damage result has been saved for the Integrated Report.
          </p>
        </div>
      )}
    </div>
  );
}

export default SatelliteDamageAnalysis;