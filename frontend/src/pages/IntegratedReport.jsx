import { useEffect, useState } from "react";

function IntegratedReport() {
  const [earthquakeResult, setEarthquakeResult] = useState(null);
  const [tweetResult, setTweetResult] = useState(null);
  const [damageResult, setDamageResult] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEarthquakeResult(null);
    setTweetResult(null);
    setDamageResult(null);
    setFinalReport(null);
    setLoaded(false);
  }, []);

  const loadAvailableAnalyses = () => {
    const earthquake = JSON.parse(localStorage.getItem("earthquakeResult"));
    const tweet = JSON.parse(localStorage.getItem("tweetResult"));
    const damage = JSON.parse(localStorage.getItem("damageResult"));

    setEarthquakeResult(earthquake);
    setTweetResult(tweet);
    setDamageResult(damage);
    setFinalReport(null);
    setLoaded(true);
  };

  const activeSourceCount =
    (earthquakeResult ? 1 : 0) +
    (tweetResult ? 1 : 0) +
    (damageResult ? 1 : 0);

  const ready = activeSourceCount >= 2;

  const getMagnitude = () => {
    return (
      Number(
        earthquakeResult?.magnitude ||
          earthquakeResult?.max_magnitude ||
          earthquakeResult?.average_magnitude ||
          earthquakeResult?.avg_magnitude ||
          0
      )
    );
  };

  const getDamageRatio = () => {
    return Number(damageResult?.damage_ratio ?? 0);
  };

  const getTweetRiskScore = () => {
    return Number(
      tweetResult?.tweet_risk_score ||
        tweetResult?.average_tweet_risk_score ||
        tweetResult?.risk_score ||
        tweetResult?.average_risk_score ||
        0
    );
  };

  const calculateDynamicRiskScore = () => {
    const scores = [];

    if (earthquakeResult) {
      scores.push({
        score: Math.min(getMagnitude() / 8, 1),
        weight: 0.4,
      });
    }

    if (damageResult) {
      scores.push({
        score: Math.min(getDamageRatio() / 100, 1),
        weight: 0.3,
      });
    }

    if (tweetResult) {
      scores.push({
        score: Math.min(getTweetRiskScore(), 1),
        weight: 0.3,
      });
    }

    if (scores.length === 0) return 0;

    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);

    const finalScore =
      scores.reduce((sum, item) => sum + item.score * item.weight, 0) /
      totalWeight;

    return Number(finalScore.toFixed(3));
  };

  const determinePriority = (score) => {
    if (score >= 0.75) return "CRITICAL";
    if (score >= 0.55) return "HIGH";
    if (score >= 0.35) return "MEDIUM";
    return "LOW";
  };

  const getActions = (priority) => {
    if (priority === "CRITICAL") {
      return [
        "Send emergency rescue teams immediately.",
        "Prioritize medical and shelter support.",
        "Increase coordination with disaster management units.",
      ];
    }

    if (priority === "HIGH") {
      return [
        "Dispatch field assessment teams.",
        "Prepare emergency aid resources.",
        "Monitor the region continuously.",
      ];
    }

    if (priority === "MEDIUM") {
      return [
        "Continue monitoring the affected region.",
        "Prepare support units if the situation worsens.",
      ];
    }

    return ["No immediate emergency action is required."];
  };

  const getRegionName = () => {
    return (
      earthquakeResult?.region ||
      tweetResult?.region ||
      damageResult?.region ||
      "Selected Region"
    );
  };

  const getRegionalPriorityList = () => {
    if (!ready) return [];

    const riskScore = calculateDynamicRiskScore();
    const priority = determinePriority(riskScore);

    return [
      {
        rank: 1,
        region: getRegionName(),
        earthquake_count: earthquakeResult
          ? earthquakeResult.total_earthquakes ||
            earthquakeResult.earthquake_count ||
            "-"
          : "-",
        tweet_count: tweetResult
          ? tweetResult.dataset_summary?.analyzed_rows ||
            tweetResult.total_tweets ||
            tweetResult.tweet_count ||
            "-"
          : "-",
        urgent_tweet_count: tweetResult
          ? tweetResult.dataset_summary?.urgent_count ||
            tweetResult.urgent_tweets ||
            tweetResult.urgent_tweet_count ||
            "-"
          : "-",
        damage_ratio: damageResult ? getDamageRatio() : "-",
        regional_risk_score: riskScore,
        priority_level: priority,
      },
    ];
  };

  const generateReport = () => {
    const riskScore = calculateDynamicRiskScore();
    const priority = determinePriority(riskScore);

    const report = {
      region: getRegionName(),
      magnitude: earthquakeResult ? getMagnitude() : "-",
      damage_ratio: damageResult ? getDamageRatio() : "-",
      tweet_risk_score: tweetResult ? getTweetRiskScore() : "-",
      tweet_label: tweetResult?.tweet_label || tweetResult?.label || "-",
      risk_score: riskScore,
      priority_level: priority,
      recommended_actions: getActions(priority),
      report:
        activeSourceCount === 3
          ? "The final emergency support report was generated using earthquake, satellite damage, and tweet analysis results."
          : "The final emergency support report was generated using the available two data sources. The missing module was ignored and the final risk score was recalculated dynamically.",
    };

    setFinalReport(report);
  };

  const regionalPriorityList = getRegionalPriorityList();

  return (
    <div className="page">
      <h1>Integrated Emergency Decision Report</h1>

      <p>
        This page generates an integrated emergency decision report only after
        analysis results are loaded. The system can work with all three sources
        or with any two available sources.
      </p>

      {!loaded && (
        <div className="section">
          <p className="hint">
            No analysis has been loaded yet. Run analysis modules first, then
            load the available results here.
          </p>

          <button onClick={loadAvailableAnalyses}>
            Load Available Analyses
          </button>
        </div>
      )}

      {loaded && activeSourceCount === 0 && (
        <div className="section">
          <p className="hint">
            No analysis result was found. Please run at least two analysis
            modules first.
          </p>

          <button onClick={loadAvailableAnalyses}>
            Reload Analyses
          </button>
        </div>
      )}

      {loaded && activeSourceCount === 1 && (
        <div className="section">
          <p className="hint">
            Only one analysis result was found. Integrated report requires at
            least two data sources.
          </p>

          <button onClick={loadAvailableAnalyses}>
            Reload Analyses
          </button>
        </div>
      )}

      {loaded && ready && (
        <>
          <div className="cards">
            <div className="card">
              <h3>Earthquake Module</h3>
              {earthquakeResult ? (
                <>
                  <p>
                    <b>Region:</b> {earthquakeResult.region || "-"}
                  </p>
                  <p>
                    <b>Max Magnitude:</b> {getMagnitude()}
                  </p>
                  <p>
                    <b>Total Events:</b>{" "}
                    {earthquakeResult.total_earthquakes ||
                      earthquakeResult.earthquake_count ||
                      "-"}
                  </p>
                  <p>
                    <b>Avg Depth:</b>{" "}
                    {earthquakeResult.average_depth || "-"} km
                  </p>
                  <p>
                    <b>Risk Level:</b>{" "}
                    {earthquakeResult.earthquake_risk_level || "-"}
                  </p>
                </>
              ) : (
                <p className="missing">Earthquake analysis is missing.</p>
              )}
            </div>

            <div className="card">
              <h3>Tweet Module</h3>
              {tweetResult ? (
                <>
                  <p>
                    <b>Source:</b> {tweetResult.source_type || "-"}
                  </p>
                  <p>
                    <b>Tweet Risk Score:</b> {getTweetRiskScore()}
                  </p>
                  <p>
                    <b>Distress Level:</b>{" "}
                    {tweetResult.tweet_label || tweetResult.label || "-"}
                  </p>

                  {tweetResult.dataset_summary && (
                    <>
                      <p>
                        <b>Analyzed Tweets:</b>{" "}
                        {tweetResult.dataset_summary.analyzed_rows}
                      </p>
                      <p>
                        <b>Urgent Tweets:</b>{" "}
                        {tweetResult.dataset_summary.urgent_count}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <p className="missing">Tweet analysis is missing.</p>
              )}
            </div>

            <div className="card">
              <h3>Satellite Damage Module</h3>
              {damageResult ? (
                <>
                  <p>
                    <b>Damage Ratio:</b> {getDamageRatio()}%
                  </p>
                  <p>
                    <b>Damage Level:</b>{" "}
                    {damageResult.damage_level || "-"}
                  </p>
                </>
              ) : (
                <p className="missing">Satellite damage analysis is missing.</p>
              )}
            </div>
          </div>

          <div className="section">
            <h2>Regional Priority Ranking</h2>

            <div className="table-wrapper">
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Region</th>
                    <th>Earthquakes</th>
                    <th>Tweets</th>
                    <th>Urgent Tweets</th>
                    <th>Damage</th>
                    <th>Risk Score</th>
                    <th>Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {regionalPriorityList.map((item) => (
                    <tr key={item.rank}>
                      <td>#{item.rank}</td>
                      <td>{item.region}</td>
                      <td>{item.earthquake_count}</td>
                      <td>{item.tweet_count}</td>
                      <td>{item.urgent_tweet_count}</td>
                      <td>
                        {item.damage_ratio === "-"
                          ? "-"
                          : `${item.damage_ratio}%`}
                      </td>
                      <td>{item.regional_risk_score}</td>
                      <td>
                        <span
                          className={`badge ${item.priority_level.toLowerCase()}`}
                        >
                          {item.priority_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            style={{ marginTop: "25px" }}
            onClick={generateReport}
          >
            Generate Final Emergency Support Report
          </button>
        </>
      )}

      {finalReport && (
        <div className={`report ${finalReport.priority_level.toLowerCase()}`}>
          <h2>Final Emergency Support Report</h2>

          <p>
            <b>Affected Region:</b> {finalReport.region}
          </p>
          <p>
            <b>Magnitude:</b> {finalReport.magnitude}
          </p>
          <p>
            <b>Estimated Damage Ratio:</b> {finalReport.damage_ratio}%
          </p>
          <p>
            <b>Social Media Distress Score:</b>{" "}
            {finalReport.tweet_risk_score}
          </p>
          <p>
            <b>Social Media Distress Level:</b> {finalReport.tweet_label}
          </p>

          <hr />

          <h3>Final Decision</h3>
          <p>
            <b>Final Risk Score:</b> {finalReport.risk_score}
          </p>
          <p>
            <b>Priority Level:</b> {finalReport.priority_level}
          </p>

          <h3>Recommended Emergency Actions</h3>
          <ul>
            {finalReport.recommended_actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>

          <h3>Decision Summary</h3>
          <p className="summary">{finalReport.report}</p>
        </div>
      )}
    </div>
  );
}

export default IntegratedReport;