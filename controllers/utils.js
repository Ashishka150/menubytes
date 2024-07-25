const { v4: uuidv4 } = require("uuid");

function generateAlphanumericUUID(length = 8) {
  const uuid = uuidv4().replace(/-/g, "");
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let alphanumericUUID = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * uuid.length);
    alphanumericUUID += chars[randomIndex % chars.length];
  }

  return alphanumericUUID;
}

module.exports = {
  generateAlphanumericUUID,
};
