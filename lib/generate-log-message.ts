import { ACTION, AuditLog } from '@prisma/client';

export const generateLogMessage = (log: AuditLog) => {
  const { action, entityTitle, entityType } = log;

  const actionMessage = {
    [ACTION.CREATE]: `created ${entityType.toLowerCase()} "${entityTitle}"`,
    [ACTION.UPDATE]: `updated ${entityType.toLowerCase()} "${entityTitle}"`,
    [ACTION.DELETE]: `deleted ${entityType.toLowerCase()} "${entityTitle}"`,
    default: `uknown action ${entityType.toLowerCase()} "${entityTitle}"`,
  };

  return actionMessage[action] || actionMessage.default;
};
