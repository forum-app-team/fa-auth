#!/usr/bin/env node

import dotenv from "dotenv";
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });

import { Op } from "sequelize";
import EmailToken from "../src/models/EmailToken.js";
import sequelize from "../src/config/connections.js";

const mode = process.argv[2] === "force" ? "force" : "normal";

const cleanupEmailTokens = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to database");

    let result;

    if (mode === "force") {
      result = await EmailToken.destroy({ where: {} });
      console.log(`Deleted all ${result} token(s)`);
    } else {

      const now = new Date();
      result = await EmailToken.destroy({
        where: {
          expiresAt: { [Op.lt]: now },
        },
      });
      console.log(`Deleted ${result} expired token(s)`);
    }

    await sequelize.close();

    console.log("Cleanup complete");

  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  }
};

cleanupEmailTokens();
