const { Sequelize } = require("sequelize");

// Use your actual PostgreSQL connection details
const sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://username:password@localhost:5432/tododb", {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
});

module.exports = sequelize;
