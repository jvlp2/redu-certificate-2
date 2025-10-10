export const CREATE_SCHEMA = {
  type: 'object',
  properties: {
    blueprintId: { type: 'string' },
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
      required: ['title', 'organization', 'workload', 'info'],
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
  required: ['backgroundImage', 'frontData', 'backData'],
};
