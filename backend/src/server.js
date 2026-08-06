const app = require('./app');

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TRUSTGUARD AI BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`🛡️  AI Guardrail Engine & Gemini Integration Active`);
  console.log(`====================================================`);
});
