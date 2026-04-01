import React, { useEffect, useState } from "react";
import { fetchQuizzes } from "../services/api";

const QuizList = ({ startQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes()
      .then(res => setQuizzes(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <section className="quiz-screen">
      <div className="card">
        <div className="section-head">
          <span className="eyebrow">Choose a quiz</span>
          <h2>Available Quizzes</h2>
        </div>

        {quizzes.length > 0 ? (
          quizzes.map(q => (
            <div key={q.id} className="quiz-item">
              <div>
                <h3>{q.title}</h3>
                <p>{q.description || "No description available."}</p>
              </div>
              <button className="button-solid" onClick={() => startQuiz(q.id)}>
                Start Quiz
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No quizzes available</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizList;