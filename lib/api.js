import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://rspf-backend.onrender.com";

const getToken = async () => {
  return await AsyncStorage.getItem("rpsf_user_token");
};

const getHeaders = async () => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// --- AUTH ---
export async function login(phone, password) {
  const response = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Invalid credentials");
  await AsyncStorage.setItem("rpsf_user_token", data.token);
  return data.user;
}

export async function logout() {
  await AsyncStorage.removeItem("rpsf_user_token");
}

// --- PROFILE ---
export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load profile");
  return data;
}

export async function updateUserProfile(updates) {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update profile");
  return data;
}

export async function changeUserPassword(newPassword, confirmPassword) {
  const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify({ newPassword, confirmPassword }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to change password");
  return data;
}

// --- DASHBOARD ---
export async function getDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/api/user/dashboard/stats`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load stats");
  return data;
}

// --- EXAMS ---
export async function getUserExams() {
  const response = await fetch(`${API_BASE_URL}/api/user/exams`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load exams");
  return data;
}

export async function getExamById(id) {
  const response = await fetch(`${API_BASE_URL}/api/user/exams/${id}`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load exam");
  return data;
}

export async function submitUserExam(id, answers) {
  const response = await fetch(`${API_BASE_URL}/api/user/exams/${id}/submit`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ answers }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to submit exam");
  return data;
}

export async function submitReattemptRequest(examId, reason) {
  const response = await fetch(
    `${API_BASE_URL}/api/user/exams/${examId}/reattempt-request`,
    {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({ reason }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to submit request");
  return data;
}

export async function getMyReattemptRequests() {
  const response = await fetch(`${API_BASE_URL}/api/user/reattempt-requests`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load requests");
  return data;
}

// --- RESULTS ---
export async function getMyResults() {
  const response = await fetch(`${API_BASE_URL}/api/user/results`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load results");
  return data;
}

export async function getMyResultById(id) {
  const response = await fetch(`${API_BASE_URL}/api/user/results/${id}`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load result");
  return data;
}

// --- SUPPORT TICKETS ---
export async function getMyTickets() {
  const response = await fetch(`${API_BASE_URL}/api/user/tickets`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load tickets");
  return data;
}

export async function createUserTicket(question) {
  const response = await fetch(`${API_BASE_URL}/api/user/tickets`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ question }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create ticket");
  return data;
}

// --- FEEDBACK ---
export async function createUserFeedback(data) {
  const response = await fetch(`${API_BASE_URL}/api/user/feedback`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok)
    throw new Error(resData.message || "Failed to submit feedback");
  return resData;
}

export async function getMyFeedbacks() {
  const response = await fetch(`${API_BASE_URL}/api/user/feedback`, {
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load feedback");
  return data;
}

export async function updateMyFeedback(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/user/feedback/${id}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok)
    throw new Error(resData.message || "Failed to update feedback");
  return resData;
}

// --- NEWS ---
export async function getLatestNews() {
  const response = await fetch(`${API_BASE_URL}/api/news`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load news");
  return data;
}

// --- SYLLABUS / COURSES ---
export async function getCourses() {
  const response = await fetch(`${API_BASE_URL}/api/education/courses`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load courses");
  return data;
}

export async function getSubjects(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/education/subjects?courseId=${courseId}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load subjects");
  return data;
}

export async function getLessons(subjectId) {
  const response = await fetch(
    `${API_BASE_URL}/api/education/lessons?subjectId=${subjectId}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load lessons");
  return data;
}

export async function deleteMyFeedback(id) {
  const response = await fetch(`${API_BASE_URL}/api/user/feedback/${id}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to delete feedback");
  return data;
}