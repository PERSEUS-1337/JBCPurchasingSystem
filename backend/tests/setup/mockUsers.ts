export const validSuperAdminUser = {
  userID: "U999",
  fullname: "Super Admin User",
  idNumber: "99999",
  username: "superadmin",
  email: "superadmin@example.com",
  password: "password123",
  role: "Super Administrator",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const expectedSuperAdminView = {
  userID: "U999",
  fullname: "Super Admin User",
  idNumber: "99999",
  username: "superadmin",
  email: "superadmin@example.com",
  role: "Super Administrator",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const validUser = {
  userID: "U001",
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
  role: "Staff",
  position: "Staff",
  department: "IT",
  status: "Active",
};

export const expectedPersonalProfileView = {
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  position: "Staff",
  department: "IT",
};

export const validUserNoPwd = {
  userID: "U001",
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  role: "Staff",
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
  role: "Staff",
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
  role: "Staff",
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
  role: "Staff",
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
  role: "Staff",
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
  role: "Guest",
  position: "Staff",
  department: "IT",
  status: "Active",
  unexpectedField: "unexpectedValue", // Invalid field
};

export const invalidStatusUser = {
  userID: "U001",
  fullname: "Test User",
  idNumber: "10001",
  username: "testuser",
  email: "testuser@example.com",
  password: "password123",
  role: "Staff",
  position: "Staff",
  department: "IT",
  status: "invalid-status",
};