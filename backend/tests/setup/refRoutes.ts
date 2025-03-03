export const apiAuthHello = "/api/auth/hello";
export const apiRegister = "/api/auth/register";
export const apiLogin = "/api/auth/login";
export const apiLogout = "api/auth/logout";
export const apiChangePassword = "/api/auth/change-pwd";
export const apiProtected = "/api/auth/protected";

export const apiUserMain = "/api/user";
export const apiUserHello = "/api/user/hello";
export const apiUserID = (userID: string) => `/api/user/${userID}`;

export const apiSupplierMain = "/api/supplier";
export const apiSupplierHello = "/api/supplier/hello";
export const apiSupplierSearch = "/api/supplier/search";
export const apiSupplierID = (supplierID: string) =>
  `/api/supplier/${supplierID}`;
export const apiSupplierContactNumbers = (supplierID: string) =>
  `/api/supplier/${supplierID}/contact-numbers`;
export const apiSupplierEmails = (supplierID: string) =>
  `/api/supplier/${supplierID}/emails`;
export const apiSupplierContactPersons = (supplierID: string) =>
  `/api/supplier/${supplierID}/contact-persons`;
export const apiSupplierContactPersonsIdx = (supplierID: string, idx: string) =>
  `/api/supplier/${supplierID}/contact-persons/${idx}`;
export const apiSupplierSupplies = (supplierID: string) =>
  `/api/supplier/${supplierID}/supplies`;
export const apiSupplierSupplyID = (supplierID: string, supplyID: string) =>
  `/api/supplier/${supplierID}/supplies/${supplyID}`;
export const apiSupplierDocs = (supplierID: string) =>
  `/api/supplier/${supplierID}/docs`;
export const apiSupplierDocsIdx = (supplierID: string, idx: string) =>
  `/api/supplier/${supplierID}/docs/${idx}`;
export const apiSupplierStatus = (supplierID: string) =>
  `/api/supplier/${supplierID}/status`;
