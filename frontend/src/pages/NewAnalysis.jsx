import { useState } from "react";
import API from "../api/api";

function NewAnalysis() {
  const [form, setForm] = useState({
    region: "",
    magnitude: "",
    damage_ratio: "",
    tweet_text: "",
  });

  const [tweetResult, setTweetResult] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const analyzeTweet = async () => {
    const response = await API.post("/tweet-analysis", {
      text: form.tweet_text,
    });

    setTweetResult(response.data);
    return response.data;
  };

  const analyze = async (e) => {
    e.preventDefault();

    const tweetAnalysis = await analyzeTweet();

    const payload = {
      region: form.region,
      magnitude: Number(form.magnitude),
      damage_ratio: Number(form.damage_ratio),
      tweet_risk_score: tweetAnalysis.tweet_risk_score,
      tweet_label: tweetAnalysis.tweet_label,
    };

    const response = await API.post(
      "/emergency-support-report",
      payload
    );

    setResult(response.data);

    const oldHistory =
      JSON.parse(localStorage.getItem("analysisHistory")) || [];

    localStorage.setItem(
      "analysisHistory",
      JSON.stringify([response.data, ...oldHistory])
    );
  };

  return (
    <div className="page">
      <h1>New Emergency Analysis</h1>

      <form className="form" onSubmit={analyze}>
        <input
          name="region"
          placeholder="Region"
          value={form.region}
          onChange={handleChange}
        />

        <input
          name="magnitude"
          placeholder="Magnitude"
          value={form.magnitude}
          onChange={handleChange}
        />

        <input
          name="damage_ratio"
          placeholder="Damage Ratio (%)"
          value={form.damage_ratio}
          onChange={handleChange}
        />

        <textarea
          name="tweet_text"
          placeholder="Enter disaster-related tweet text..."
          value={form.tweet_text}
          onChange={handleChange}
        />

        <button type="submit">
          Generate Integrated Emergency Report
        </button>
      </form>

      {tweetResult && (
        <div className={`report ${tweetResult.tweet_label}`}>
          <h2>Tweet Analysis Result</h2>
          <p>
            <b>Tweet Label:</b> {tweetResult.tweet_label}
          </p>
          <p>
            <b>Tweet Risk Score:</b>{" "}
            {tweetResult.tweet_risk_score}
          </p>

          <h3>Detected Emergency Keywords</h3>

          {tweetResult.matched_strong_keywords.length > 0 ? (
            <ul>
              {tweetResult.matched_strong_keywords.map(
                (keyword, index) => (
                  <li key={index}>{keyword}</li>
                )
              )}
            </ul>
          ) : (
            <p>No strong emergency keyword detected.</p>
          )}
        </div>
      )}

      {result && (
        <div className={`report ${result.priority_level.toLowerCase()}`}>
          <h2>Emergency Support Report</h2>

          <p>
            <b>Region:</b> {result.region}
          </p>

          <p>
            <b>Magnitude:</b> {result.magnitude}
          </p>

          <p>
            <b>Damage Ratio:</b> {result.damage_ratio}%
          </p>

          <p>
            <b>Tweet Risk Score:</b>{" "}
            {result.tweet_risk_score}
          </p>

          <p>
            <b>Tweet Label:</b> {result.tweet_label}
          </p>

          <p>
            <b>Final Risk Score:</b> {result.risk_score}
          </p>

          <p>
            <b>Priority Level:</b> {result.priority_level}
          </p>

          <h3>Recommended Actions</h3>

          <ul>
            {result.recommended_actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>

          <p className="summary">{result.report}</p>
        </div>
      )}
    </div>
  );
}

export default NewAnalysis;