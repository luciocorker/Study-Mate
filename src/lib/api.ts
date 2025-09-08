// API configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://study-mate-production.up.railway.app'  // Replace with your actual Railway URL
  : 'http://localhost:3001';

export const API_ENDPOINTS = {
  generateAI: `${API_BASE_URL}/api/generate-ai`,
  uploadPDF: `${API_BASE_URL}/api/upload-pdf`,
  pdfQA: `${API_BASE_URL}/api/pdf-qa`,
  generateTest: `${API_BASE_URL}/api/generate-test`,
  userPDFs: (userId: string) => `${API_BASE_URL}/api/user-pdfs/${userId}`,
};

export { API_BASE_URL };
