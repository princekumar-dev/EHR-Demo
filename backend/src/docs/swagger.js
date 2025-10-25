export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EHR Demo API',
    version: '1.0.0',
    description: 'Electronic Health Record API documentation',
  },
  servers: [
    {
      url: 'http://localhost:5000',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['patient', 'doctor'] },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Login success' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: { description: 'User created' },
        },
      },
    },
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        responses: { 200: { description: 'List appointments' } },
      },
      post: {
        tags: ['Appointments'],
        responses: { 201: { description: 'Create appointment' } },
      },
    },
    '/api/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Update appointment status' } },
      },
    },
    '/api/prescriptions': {
      get: {
        tags: ['Prescriptions'],
        responses: { 200: { description: 'List prescriptions' } },
      },
      post: {
        tags: ['Prescriptions'],
        responses: { 201: { description: 'Create prescription' } },
      },
    },
    '/api/prescriptions/{id}': {
      get: {
        tags: ['Prescriptions'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Get prescription' } },
      },
    },
    '/api/prescriptions/{id}/pdf': {
      get: {
        tags: ['Prescriptions'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Download prescription PDF' } },
      },
    },
    '/api/lookup/doctors': {
      get: {
        tags: ['Directory'],
        responses: { 200: { description: 'List doctors' } },
      },
    },
  },
};
