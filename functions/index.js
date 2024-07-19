import { defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

// Define configuration parameters
const QuickNodeURL = defineString("QUICKNODE_URL");

exports.length = onRequest({ cors: ["*"] }, async (req, res) => {
  //   return the length of the string
  const result = {
    message: "Hello from Firebase!",
    length: QuickNodeURL.toString().length,
  };
  res.status(200).send(result);
});

// https://us-central1-stellar-indexed.cloudfunctions.net/length
