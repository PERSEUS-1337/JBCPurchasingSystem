export const validUser = {
  userID: "U001",
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
  role: "User",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const validUserNoPwd = {
  userID: "U001",
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  role: "User",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const noUsernameUser = {
  userID: "U002",
  fullname: "No Username User",
  idNumber: "10002",
  email: "nousername@example.com",
  password: "password123",
  role: "User",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const noPasswordUser = {
  userID: "U003",
  fullname: "No Password User",
  idNumber: "10003",
  username: "nopassword",
  email: "nopassword@example.com",
  role: "User",
  position: "Staff",
  department: "Finance",
  status: "Active",
};

export const weakPasswordUser = {
  userID: "U004",
  fullname: "Weak Password User",
  idNumber: "10004",
  username: "weakpassword",
  email: "weakpassword@example.com",
  password: "123", // Weak password
  role: "User",
  position: "Staff",
  department: "Marketing",
  status: "Active",
};

export const shortUsernameUser = {
  userID: "U005",
  fullname: "Short Username User",
  idNumber: "10005",
  username: "a", // Too short
  email: "shortusername@example.com",
  password: "password123",
  role: "User",
  position: "Intern",
  department: "HR",
  status: "Active",
};

export const unexpectedUser = {
  userID: "U006",
  fullname: "Unexpected Field User",
  idNumber: "10006",
  username: "testuser3",
  email: "unexpected@example.com",
  password: "password123",
  role: "User",
  position: "Staff",
  department: "IT",
  status: "Active",
  unexpectedField: "unexpectedValue", // Invalid field
};

export const validLoginData = {
  email: validUser.email,
  password: validUser.password,
};
export const invalidEmailUser = {
  email: "invalid@example.com",
  password: "password123",
};
export const invalidPasswordUser = {
  email: validUser.email,
  password: "wrongpassword",
};