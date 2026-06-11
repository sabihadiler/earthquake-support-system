import { useEffect, useState } from "react";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("analysisHistory")) || [];
    setHistory(data);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("analysisHistory");
    setHistory([]);
  };

  return (
    <div className="page">
      <h1>Analysis History</h1>

      <button onClick={clearHistory}>Clear History</button>

      {history.length === 0 && <p>No analysis records found.</p>}

      <div className="history-list">
        {history.map((item, index) => (
          <div className="history-card" key={index}>
            <h3>{item.region}</h3>
            <p><b>Risk Score:</b> {item.risk_score}</p>
            <p><b>Priority:</b> {item.priority_level}</p>
            <p>{item.report}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;