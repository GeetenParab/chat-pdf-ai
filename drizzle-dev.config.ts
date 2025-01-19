// import { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

// export default {
//   dialect: "pg",
//   schema: "./src/lib/db/schema.ts",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// } satisfies Config;


export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
});

// npx drizzle-kit push:pg
// npx drizzle-kit push --config=drizzle-dev.config.ts     
// studio npx drizzle-kit studio --host localhost --port 3001 --verbose --config drizzle.config.ts
