import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../services/api";

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard()
      .then((res) => setEntries(res.data || []))
      .catch(() => setError("Unable to load leaderboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="quiz-screen">
      <div className="card">
        <div className="section-head">
          <span className="eyebrow">Leaderboard</span>
          <h2>Top quiz performers</h2>
        </div>

        {loading ? (
          <p className="empty-state">Loading leaderboard…</p>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">No leaderboard entries available yet.</div>
        ) : (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td>{index + 1}</td>
                    <td>{entry.name || "Anonymous"}</td>
                    <td>{entry.quizTitle || entry.quiz || "Quiz"}</td>
                    <td>{entry.score != null ? entry.score : "—"}</td>
                    <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Leaderboard;
