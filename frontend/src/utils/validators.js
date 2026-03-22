export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateStudentId = (id) => {
  return id && id.length >= 8 && id.length <= 10;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
};

export const validateGPA = (gpa) => {
  const num = parseFloat(gpa);
  return !isNaN(num) && num >= 0 && num <= 4.0;
};