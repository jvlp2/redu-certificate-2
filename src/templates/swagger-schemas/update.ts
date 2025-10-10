export const UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    backgroundImage: { type: 'string', format: 'binary' },
    logoImages: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      maxItems: 3,
    },
    signatureImages: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
      maxItems: 3,
    },
    frontData: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        organization: { type: 'string' },
        workload: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        info: { type: 'string' },
        signatureData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },
    },
    backData: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        footer: { type: 'string' },
        content: { type: 'string' },
      },
    },
  },
};
