import dotenv from "dotenv";
import fs from "fs";

async function login() {
  dotenv.config();
  const API_TOKEN = process.env.VITE_API_TOKEN;
  fs.writeFileSync(".env", `VITE_API_TOKEN=${API_TOKEN}`);
  console.log("saved jwt to .env file");
}

login();
