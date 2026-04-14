import { env } from "./config/index.js";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
