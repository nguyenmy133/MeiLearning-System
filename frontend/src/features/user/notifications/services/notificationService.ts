export const notificationService = {
  async getNotifications() {
    // TODO: Backend notification endpoint not yet implemented
    return [];
  },

  async markRead(id: number) {
    // TODO: Backend notification endpoint not yet implemented
    return;
  },

  async markAllRead() {
    // TODO: Backend notification endpoint not yet implemented
    return;
  },
};

// Named function exports
export const getNotifications = notificationService.getNotifications;
export const markNotificationRead = notificationService.markRead;
export const markAllRead = notificationService.markAllRead;
