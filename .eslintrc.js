module.exports = {
  env: {
    browser: true,
    es2020: true,  // ✅ Enables BigInt support
  },
  extends: ["react-app", "react-app/jest"],
  rules: {
    "no-undef": "off", // Optional: Disables undefined variable warnings
  },
};
