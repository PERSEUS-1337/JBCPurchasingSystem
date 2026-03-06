import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "JBC Purchasing System API",
      version: "1.1.0",
      description:
        "Interactive API documentation for the JBC Purchasing System backend.",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local backend server",
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Suppliers" },
      { name: "Supplies" },
      { name: "Purchase Requests" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            error: { type: "string" },
          },
          required: ["message"],
        },

        UserRole: {
          type: "string",
          enum: [
            "Super Administrator",
            "Manager",
            "Staff",
            "Requester",
            "Chief Officer",
            "Purchaser",
          ],
        },
        UserStatus: {
          type: "string",
          enum: ["Active", "Inactive"],
        },
        SupplierStatus: {
          type: "string",
          enum: ["Active", "Inactive"],
        },
        SupplyStatus: {
          type: "string",
          enum: ["Active", "Inactive"],
        },
        PRStatus: {
          type: "string",
          enum: [
            "Draft",
            "Recommended",
            "Submitted",
            "Approved",
            "Rejected",
            "Cancelled",
          ],
        },

        User: {
          type: "object",
          properties: {
            userID: { type: "string" },
            fullname: { type: "string" },
            email: { type: "string", format: "email" },
            role: { $ref: "#/components/schemas/UserRole" },
            position: { type: "string" },
            department: { type: "string" },
            status: { $ref: "#/components/schemas/UserStatus" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RegisterRequest: {
          type: "object",
          properties: {
            userID: { type: "string" },
            fullname: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { $ref: "#/components/schemas/UserRole" },
            position: { type: "string", minLength: 1 },
            department: { type: "string", minLength: 1 },
          },
          required: [
            "userID",
            "fullname",
            "email",
            "password",
            "position",
            "department",
          ],
          additionalProperties: false,
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["email", "password"],
          additionalProperties: false,
        },
        ChangePasswordRequest: {
          type: "object",
          properties: {
            currentPassword: { type: "string", minLength: 8 },
            newPassword: {
              type: "string",
              minLength: 8,
              pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
            },
          },
          required: ["currentPassword", "newPassword"],
          additionalProperties: false,
        },
        UserUpdateRequest: {
          type: "object",
          properties: {
            fullname: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            position: { type: "string", minLength: 1 },
            department: { type: "string", minLength: 1 },
          },
          additionalProperties: false,
        },

        ContactPerson: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            contactNumber: {
              type: "string",
              minLength: 10,
              maxLength: 14,
              pattern: "^\\+?\\d{10,14}$",
            },
            email: { type: "string", format: "email" },
            position: { type: "string" },
          },
          required: ["name", "contactNumber"],
        },
        Supplier: {
          type: "object",
          properties: {
            supplierID: {
              type: "string",
              pattern: "^SUP-\\d+$",
            },
            name: { type: "string", minLength: 1, maxLength: 100 },
            contactNumbers: {
              type: "array",
              items: { type: "string", pattern: "^\\+?\\d{10,14}$" },
              minItems: 1,
            },
            emails: {
              type: "array",
              items: { type: "string", format: "email" },
            },
            contactPersons: {
              type: "array",
              items: { $ref: "#/components/schemas/ContactPerson" },
            },
            address: { type: "string", minLength: 1, maxLength: 255 },
            primaryTag: { type: "string", minLength: 1 },
            tags: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
            documentation: {
              type: "array",
              items: { type: "string" },
            },
            status: { $ref: "#/components/schemas/SupplierStatus" },
            supplies: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        SupplierCreateRequest: {
          allOf: [{ $ref: "#/components/schemas/Supplier" }],
          required: [
            "supplierID",
            "name",
            "contactNumbers",
            "address",
            "primaryTag",
            "tags",
          ],
        },
        SupplierUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            contactNumbers: {
              type: "array",
              items: { type: "string", pattern: "^\\+?\\d{10,14}$" },
              minItems: 1,
            },
            emails: {
              type: "array",
              items: { type: "string", format: "email" },
            },
            contactPersons: {
              type: "array",
              items: { $ref: "#/components/schemas/ContactPerson" },
            },
            address: { type: "string", minLength: 1, maxLength: 255 },
            primaryTag: { type: "string", minLength: 1 },
            tags: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
            documentation: {
              type: "array",
              items: { type: "string" },
            },
            status: { $ref: "#/components/schemas/SupplierStatus" },
            supplies: {
              type: "array",
              items: { type: "string" },
            },
          },
          additionalProperties: false,
        },
        SupplierStatusUpdateRequest: {
          type: "object",
          properties: {
            status: { $ref: "#/components/schemas/SupplierStatus" },
          },
          required: ["status"],
          additionalProperties: false,
        },

        Specification: {
          type: "object",
          properties: {
            specProperty: { type: "string", minLength: 1 },
            specValue: {
              oneOf: [{ type: "string" }, { type: "number" }],
            },
          },
          required: ["specProperty", "specValue"],
        },
        SupplierPricing: {
          type: "object",
          properties: {
            supplier: {
              type: "string",
              description: "MongoDB ObjectId of supplier",
              pattern: "^[a-fA-F0-9]{24}$",
            },
            price: { type: "number", minimum: 0, maximum: 1000000 },
            priceValidity: {
              type: "string",
              format: "date-time",
            },
            unitQuantity: { type: "number", minimum: 1 },
            unitPrice: { type: "number", minimum: 0, maximum: 1000000 },
          },
          required: [
            "supplier",
            "price",
            "priceValidity",
            "unitQuantity",
            "unitPrice",
          ],
        },
        Supply: {
          type: "object",
          properties: {
            supplyID: { type: "string", pattern: "^SPL-\\d+$" },
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1 },
            categories: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
            unitMeasure: { type: "string", minLength: 1 },
            supplierPricing: {
              type: "array",
              items: { $ref: "#/components/schemas/SupplierPricing" },
              minItems: 1,
            },
            specifications: {
              type: "array",
              items: { $ref: "#/components/schemas/Specification" },
              minItems: 1,
            },
            status: { $ref: "#/components/schemas/SupplyStatus" },
            attachments: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        SupplyCreateRequest: {
          allOf: [{ $ref: "#/components/schemas/Supply" }],
          required: [
            "supplyID",
            "name",
            "description",
            "categories",
            "unitMeasure",
            "supplierPricing",
            "specifications",
          ],
        },
        SupplyUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1 },
            categories: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
            unitMeasure: { type: "string", minLength: 1 },
            status: { $ref: "#/components/schemas/SupplyStatus" },
            attachments: {
              type: "array",
              items: { type: "string" },
            },
          },
          additionalProperties: false,
        },
        SupplyStatusUpdateRequest: {
          type: "object",
          properties: {
            status: { $ref: "#/components/schemas/SupplyStatus" },
          },
          required: ["status"],
          additionalProperties: false,
        },
        SupplierPricingRequest: {
          $ref: "#/components/schemas/SupplierPricing",
        },

        PRItem: {
          type: "object",
          properties: {
            prItemID: { type: "string", minLength: 1 },
            prID: { type: "string", minLength: 1 },
            supplyID: { type: "string", minLength: 1 },
            supplierID: { type: "string", minLength: 1 },
            itemDescription: { type: "string", minLength: 1 },
            quantity: { type: "number", minimum: 1 },
            unitOfMeasurement: { type: "string", minLength: 1 },
            unitPrice: { type: "number", minimum: 0 },
            totalPrice: { type: "number", minimum: 0 },
            deliveryAddress: { type: "string", minLength: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "prItemID",
            "prID",
            "supplyID",
            "supplierID",
            "itemDescription",
            "quantity",
            "unitOfMeasurement",
            "unitPrice",
            "deliveryAddress",
          ],
        },
        PR: {
          type: "object",
          properties: {
            prID: { type: "string", minLength: 1 },
            projCode: { type: "string", minLength: 1 },
            projName: { type: "string", minLength: 1 },
            projClient: { type: "string", minLength: 1 },
            dateRequested: { type: "string", format: "date-time" },
            dateRequired: { type: "string", format: "date-time" },
            requestedBy: { type: "string", minLength: 1 },
            recommendedBy: { type: "string" },
            approvedBy: { type: "string" },
            prStatus: { $ref: "#/components/schemas/PRStatus" },
            itemsRequested: {
              type: "array",
              items: {
                type: "string",
                description: "MongoDB ObjectId of PR item",
                pattern: "^[a-fA-F0-9]{24}$",
              },
            },
            totalCost: { type: "number", minimum: 0 },
            justification: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "prID",
            "projCode",
            "projName",
            "projClient",
            "dateRequested",
            "dateRequired",
            "requestedBy",
            "approvedBy",
            "prStatus",
            "totalCost",
          ],
        },
        PRCreateRequest: {
          $ref: "#/components/schemas/PR",
        },
        PRUpdateRequest: {
          type: "object",
          properties: {
            projCode: { type: "string", minLength: 1 },
            projName: { type: "string", minLength: 1 },
            projClient: { type: "string", minLength: 1 },
            dateRequested: { type: "string", format: "date-time" },
            dateRequired: { type: "string", format: "date-time" },
            requestedBy: { type: "string", minLength: 1 },
            recommendedBy: { type: "string" },
            approvedBy: { type: "string" },
            prStatus: { $ref: "#/components/schemas/PRStatus" },
            totalCost: { type: "number", minimum: 0 },
            justification: { type: "string" },
          },
          additionalProperties: false,
        },
        PRStatusUpdateRequest: {
          type: "object",
          properties: {
            prStatus: { $ref: "#/components/schemas/PRStatus" },
            recommendedBy: { type: "string" },
            approvedBy: { type: "string" },
          },
          required: ["prStatus"],
          additionalProperties: false,
        },
        PRItemUpdateRequest: {
          type: "object",
          properties: {
            supplyID: { type: "string", minLength: 1 },
            supplierID: { type: "string", minLength: 1 },
            itemDescription: { type: "string", minLength: 1 },
            quantity: { type: "number", minimum: 1 },
            unitOfMeasurement: { type: "string", minLength: 1 },
            unitPrice: { type: "number", minimum: 0 },
            totalPrice: { type: "number", minimum: 0 },
            deliveryAddress: { type: "string", minLength: 1 },
          },
          additionalProperties: false,
        },

        DataUserResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { $ref: "#/components/schemas/User" },
          },
          required: ["message"],
        },
        DataUsersResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
          },
          required: ["message"],
        },
        DataSupplierResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { $ref: "#/components/schemas/Supplier" },
          },
          required: ["message"],
        },
        DataSuppliersResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Supplier" },
            },
          },
          required: ["message"],
        },
        DataSupplyResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { $ref: "#/components/schemas/Supply" },
          },
          required: ["message"],
        },
        DataSuppliesResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Supply" },
            },
          },
          required: ["message"],
        },
        DataPRResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { $ref: "#/components/schemas/PR" },
          },
          required: ["message"],
        },
        DataPRItemsResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/PRItem" },
            },
          },
          required: ["message"],
        },
        PRListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/PR" },
            },
            pagination: {
              type: "object",
              properties: {
                currentPage: { type: "number" },
                totalPages: { type: "number" },
                totalItems: { type: "number" },
                itemsPerPage: { type: "number" },
              },
            },
          },
          required: ["success", "data"],
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },

      "/api/auth/hello": {
        get: {
          tags: ["Auth"],
          summary: "Public auth test route",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataUserResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Logged in",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          accessToken: { type: "string" },
                          refreshToken: { type: "string" },
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                    required: ["message"],
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user",
          responses: {
            "200": {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/refresh": {
        get: {
          tags: ["Auth"],
          summary: "Refresh access token",
          responses: {
            "200": {
              description: "Refreshed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          accessToken: { type: "string" },
                        },
                      },
                    },
                    required: ["message"],
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/protected": {
        get: {
          tags: ["Auth"],
          summary: "Protected auth route",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/change-pwd": {
        patch: {
          tags: ["Auth"],
          summary: "Change password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      "/api/user/hello": {
        get: {
          tags: ["Users"],
          summary: "Public user test route",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/user": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataUsersResponse" },
                },
              },
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/user/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataUserResponse" },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/user/{userID}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataUserResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Users"],
          summary: "Update user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserUpdateRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataUserResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      "/api/supplier/hello": {
        get: {
          tags: ["Suppliers"],
          summary: "Public supplier test route",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supplier": {
        get: {
          tags: ["Suppliers"],
          summary: "Get all suppliers",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DataSuppliersResponse",
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Suppliers"],
          summary: "Create supplier",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplierCreateRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplierResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supplier/search": {
        get: {
          tags: ["Suppliers"],
          summary: "Search suppliers",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DataSuppliersResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/supplier/{supplierID}": {
        get: {
          tags: ["Suppliers"],
          summary: "Get supplier by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplierResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        patch: {
          tags: ["Suppliers"],
          summary: "Update supplier",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplierUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplierResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Suppliers"],
          summary: "Delete supplier",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supplier/{supplierID}/status": {
        patch: {
          tags: ["Suppliers"],
          summary: "Update supplier status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplierStatusUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplierResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supplier/{supplierID}/supplies": {
        get: {
          tags: ["Suppliers"],
          summary: "Get supplies of supplier",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSuppliesResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Suppliers"],
          summary: "Add supply to supplier",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    supplyID: { type: "string" },
                  },
                  required: ["supplyID"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Added",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supplier/{supplierID}/supplies/{supplyID}": {
        delete: {
          tags: ["Suppliers"],
          summary: "Remove supply from supplier",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplierID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Removed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },

      "/api/supply/hello": {
        get: {
          tags: ["Supplies"],
          summary: "Public supply test route",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply": {
        get: {
          tags: ["Supplies"],
          summary: "Get all supplies",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSuppliesResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Supplies"],
          summary: "Create supply",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SupplyCreateRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply/search": {
        get: {
          tags: ["Supplies"],
          summary: "Search supplies",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "query",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSuppliesResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply/{supplyID}": {
        get: {
          tags: ["Supplies"],
          summary: "Get supply by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        patch: {
          tags: ["Supplies"],
          summary: "Update supply",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SupplyUpdateRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Supplies"],
          summary: "Delete supply",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply/{supplyID}/status": {
        patch: {
          tags: ["Supplies"],
          summary: "Update supply status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplyStatusUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply/{supplyID}/suppliers": {
        get: {
          tags: ["Supplies"],
          summary: "Get suppliers of supply",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DataSuppliersResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/supply/{supplyID}/supplier-pricing": {
        post: {
          tags: ["Supplies"],
          summary: "Add supplier pricing",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SupplierPricingRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/supply/{supplyID}/supplier-pricing/{supplier}": {
        patch: {
          tags: ["Supplies"],
          summary: "Update supplier pricing",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "supplier",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SupplierPricingRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Supplies"],
          summary: "Remove supplier pricing",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "supplyID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "supplier",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataSupplyResponse" },
                },
              },
            },
          },
        },
      },

      "/api/pr/hello": {
        get: {
          tags: ["Purchase Requests"],
          summary: "Public purchase request test route",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pr": {
        get: {
          tags: ["Purchase Requests"],
          summary: "Get all purchase requests",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              schema: { $ref: "#/components/schemas/PRStatus" },
            },
            { name: "requestedBy", in: "query", schema: { type: "string" } },
            { name: "projCode", in: "query", schema: { type: "string" } },
            {
              name: "page",
              in: "query",
              schema: { type: "number", minimum: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PRListResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Purchase Requests"],
          summary: "Create purchase request",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PRCreateRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pr/{prID}": {
        get: {
          tags: ["Purchase Requests"],
          summary: "Get purchase request by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Purchase Requests"],
          summary: "Update purchase request",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PRUpdateRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Purchase Requests"],
          summary: "Delete purchase request",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pr/{prID}/status": {
        patch: {
          tags: ["Purchase Requests"],
          summary: "Update purchase request status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PRStatusUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pr/{prID}/items": {
        get: {
          tags: ["Purchase Requests"],
          summary: "Get items of purchase request",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRItemsResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Purchase Requests"],
          summary: "Add item to purchase request",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PRItem" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Purchase Requests"],
          summary: "Bulk update items of purchase request",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PRItem" },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pr/{prID}/items/{itemID}": {
        put: {
          tags: ["Purchase Requests"],
          summary: "Update purchase request item",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "itemID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PRItemUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Purchase Requests"],
          summary: "Remove purchase request item",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "prID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "itemID",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DataPRResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const openApiSpec = swaggerJSDoc(options);
