const app = require("./app");
const { sequelize } = require("./models");

(async () => {
  await sequelize.sync();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Running on port ${port}`));
})();
