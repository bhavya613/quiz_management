import axios from "axios";

const API_URL = "http://localhost:9001";

export const fetchQuizzes = () => {
  return axios.get(`${API_URL}/quiz/all`);
};

export const fetchQuestions = (quizId) => {
  return axios.get(`${API_URL}/quiz/questions/${quizId}`);
};

export const submitQuiz = (responses) => {
  return axios.post(`${API_URL}/quiz/submit`, responses);
};

export const createQuiz = (data) => {
  return axios.post(`${API_URL}/quiz/create`, data);
};

export const addQuestion = (data) => {
  return axios.post(`${API_URL}/question/add`, data);
};

export const deleteQuestion = (questionId) => {
  return axios.delete(`${API_URL}/question/${questionId}`);
};

export const fetchLeaderboard = () => {
  return axios.get(`${API_URL}/leaderboard`);
};