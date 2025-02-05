export const validSupplier = {
  supplierID: "SUP-001",
  name: "ABC Supplies",
  contactPerson: "John Doe",
  contactNumber: "123456789",
  email: "abc@example.com",
  address: "123 Main St",
};
export const validSupplierWithDocumentation = {
  supplierID: "SUP-001",
  name: "ABC Supplies",
  contactPerson: "John Doe",
  contactNumber: "123456789",
  email: "abc@example.com",
  address: "123 Main St",
  documentation: ["license.pdf", "certificate.jpg"],
};

export const invalidSupplierMissingFields = {
  contactPerson: "John Doe",
  contactNumber: "123456789",
  email: "abc@example.com",
  address: "123 Main St",
};
