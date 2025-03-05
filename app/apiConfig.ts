// apiConfig.ts (or apiConfig.js)

const API_BASE_URL = "https://carenest-api.onrender.com/api"; // Your base API URL

export const API_ENDPOINTS = {
  CHILDREN: `${API_BASE_URL}/users/getChildren`,
  ADMIN_CHILDREN: `${API_BASE_URL}/admin/getChildren`,
  ADD_CHILD: `${API_BASE_URL}/users/add-child`,
  CHILD_LOG: `${API_BASE_URL}/users/child-log`,
  SIGNIN: `${API_BASE_URL}/users/login`,
  GET_FILE: `${API_BASE_URL}/users/getFile`,
  GET_EMP: `${API_BASE_URL}/admin/getEmployees`,
  ADD_EMP: `${API_BASE_URL}/admin/add-employee`,
  LATEST_NOTICE: `${API_BASE_URL}/users/latest-notice`,
  FOOD_ADD: `${API_BASE_URL}/users/food-log`,
  NOTICE: `${API_BASE_URL}/users/notices`,
  ADD_NOTICE: `${API_BASE_URL}/admin/addNotice`,
  FOOD_LOG: `${API_BASE_URL}/admin/foodLogs`,
  EMP_ATTENDANCE: `${API_BASE_URL}/admin/empAttendance`,
  CHECK_IN: `${API_BASE_URL}/users/checkin`,
  CHECK_OUT: `${API_BASE_URL}/users/checkout`,
  // Add other API endpoints here
};
