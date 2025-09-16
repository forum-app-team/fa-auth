import "dotenv/config";

import app from "./app.js";
import sequelize from "./src/config/connections.js"
// import Identity from "./src/models/Identity.js";

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Unable to start service:", err);
    process.exit(1); 
  }
})();