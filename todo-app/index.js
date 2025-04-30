const app = require("./app");
const port = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
