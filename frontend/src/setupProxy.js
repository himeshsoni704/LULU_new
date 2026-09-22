const rockyChatHandler = require("../../api/rocky/chat").default;

module.exports = function setupProxy(app) {
  app.post("/api/rocky/chat", rockyChatHandler);
};
