import "dotenv-config";

import app from "./app";
import sequelize from "./src/configs/connections";

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1); 
  }
})();