export const UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    backgroundImage: { type: 'string', format: 'binary' },
    frontData: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        organization: { type: 'string' },
        workload: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        info: { type: 'string' },
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
