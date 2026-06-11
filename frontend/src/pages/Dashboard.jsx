function Dashboard() {
  return (
    <div className="page">
      <h1>Emergency Decision Dashboard</h1>
      <p>
        This system combines earthquake magnitude, estimated damage ratio, and
        social media distress signals to generate emergency support recommendations.
      </p>

      <div className="cards">
        <div className="card">
          <h3>Earthquake Analysis</h3>
          <p>Magnitude-based regional risk evaluation.</p>
        </div>

        <div className="card">
          <h3>Damage Assessment</h3>
          <p>Satellite-based structural damage estimation.</p>
        </div>

        <div className="card">
          <h3>Social Media Analysis</h3>
          <p>Urgency detection from disaster-related text.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;