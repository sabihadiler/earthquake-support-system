import { useState } from "react";
import API from "../api/api";

function TweetAnalysis() {
  const [tweetText, setTweetText] = useState("");
  const [singleResult, setSingleResult] = useState(null);

  const [file, setFile] = useState(null);
  const [datasetResult, setDatasetResult] = useState(null);

  const analyzeSingleTweet = async (e) => {
    e.preventDefault();

    const response = await APIeet-ana.post("/tweet-model-analysis", {
      text: tweetText,
    });

    setSingleResult(response.data);
    setDatasetResult(null);

    localStorage.setItem(
      "tweetResult",
      JSON.stringify({
        tweet_risk_score: response.data.tweet_risk_score,
        tweet_label: response.data.tweet_label,
        source_type: "single_tweet",
        original_text: response.data.original_text,
        matched_strong_keywords: response.data.matched_strong_keywords,
        matched_weak_keywords: response.data.matched_weak_keywords,
      })
    );
  };

  const analyzeDataset = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post("/tweet-dataset-analysis", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setDatasetResult(response.data);
    setSingleResult(null);

    localStorage.setItem(
      "tweetResult",
      JSON.stringify({
        tweet_risk_score: response.data.average_tweet_risk_score,
        tweet_label: response.data.dataset_distress_level,
        source_type: "tweet_dataset",
        dataset_summary: response.data,
      })
    );
  };

  return (
    <div className="page">
      <h1>Tweet Emergency Analysis</h1>

      <div className="section">
        <h2>Single Tweet Analysis</h2>

        <form className="form" onSubmit={analyzeSingleTweet}>
          <textarea
            placeholder="Enter disaster-related tweet text..."
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
          />

          <button type="submit">Analyze Tweet</button>
        </form>

        {singleResult && (
          <div className={`report ${singleResult.tweet_label}`}>
            <h3>Single Tweet Result</h3>

            <p>
              <b>Original Text:</b> {singleResult.original_text}
            </p>

            <p>
              <b>Cleaned Text:</b> {singleResult.cleaned_text}
            </p>

            <p>
              <b>Risk Score:</b> {singleResult.tweet_risk_score}
            </p>

            <p>
              <b>Label:</b> {singleResult.tweet_label}
            </p>

            <h4>Strong Emergency Keywords</h4>

            {singleResult.matched_strong_keywords?.length > 0 ? (
              <ul>
                {singleResult.matched_strong_keywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            ) : (
              <p>No strong emergency keyword detected.</p>
            )}

            <h4>Weak Disaster Keywords</h4>

            {singleResult.matched_weak_keywords?.length > 0 ? (
              <ul>
                {singleResult.matched_weak_keywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            ) : (
              <p>No weak disaster keyword detected.</p>
            )}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Tweet Dataset Analysis</h2>

        <form className="form" onSubmit={analyzeDataset}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit">Analyze Dataset</button>
        </form>

        {datasetResult && (
          <div className={`report ${datasetResult.dataset_distress_level}`}>
            <h3>Dataset Analysis Result</h3>

            <p>
              <b>Used Text Column:</b> {datasetResult.used_text_column}
            </p>

            <p>
              <b>Total Rows in File:</b> {datasetResult.total_rows_in_file}
            </p>

            <p>
              <b>Analyzed Rows:</b> {datasetResult.analyzed_rows}
            </p>

            <p>
              <b>Urgent Tweets:</b> {datasetResult.urgent_count}
            </p>

            <p>
              <b>Medium Tweets:</b> {datasetResult.medium_count}
            </p>

            <p>
              <b>Low Tweets:</b> {datasetResult.low_count}
            </p>

            <p>
              <b>Average Risk Score:</b>{" "}
              {datasetResult.average_tweet_risk_score}
            </p>

            <p>
              <b>Dataset Distress Level:</b>{" "}
              {datasetResult.dataset_distress_level}
            </p>

            <h4>Urgent Tweets</h4>

            {datasetResult.sample_results?.length > 0 ? (
              <div className="history-list">
                {datasetResult.sample_results
                  .filter((item) => item.tweet_label === "urgent")
                  .map((item, index) => (
                    <div className="history-card" key={index}>
                      <p>
                        <b>Tweet:</b> {item.original_text}
                      </p>

                      <p>
                        <b>Label:</b> {item.tweet_label}
                      </p>

                      <p>
                        <b>Score:</b> {item.tweet_risk_score}
                      </p>

                      {item.matched_strong_keywords?.length > 0 && (
                        <>
                          <p>
                            <b>Detected Emergency Keywords:</b>
                          </p>

                          <ul>
                            {item.matched_strong_keywords.map((keyword, i) => (
                              <li key={i}>{keyword}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p>No urgent tweet detected in analyzed rows.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TweetAnalysis;