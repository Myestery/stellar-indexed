import axios from "axios";
import { defineString } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
initializeApp();

// Define configuration parameters
const QuickNodeURL = defineString("QUICKNODE_URL").value();
const db = getFirestore();
const QUICKNODE_USAGE_PER_DAY = 166_166;

const Limiter = async () => {
  const dateKey = new Date().toISOString().split("T")[0];
  const docRef = db.collection("rates").doc("days");
  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      const currentRate = data[dateKey] || 0;

      if (currentRate >= QUICKNODE_USAGE_PER_DAY) {
        return false;
      }

      await docRef.update({
        [dateKey]: admin.firestore.FieldValue.increment(1),
      });
      return true;
      
    } else {
      await docRef.set({
        [dateKey]: 1,
      });
      return true;
    }
  } catch (error) {
    console.error("Error updating rate: ", error);
  }
};

export const quickNodeQuery = onRequest({ cors: ["*"] }, async (req, res) => {
  let status = await Limiter();
  if (!status) {
    res.status(429).send({
      error: "Rate limit exceeded",
      message: "You have exceeded the daily rate limit",
    });
    return;
  }
  const body = req.body;
  // send the query to quicknode
  try {
    const req = await axios.post(QuickNodeURL, body);
    const result = req.data;
    res.status(200).send(result);
  } catch (error) {
    console.error("Error querying QuickNode: ", error);
    res.status(500).send({
      error: "Internal server error",
      message: error.message,
      data: error.response?.data,
    });
  }
});

// https://us-central1-stellar-indexed.cloudfunctions.net/length
