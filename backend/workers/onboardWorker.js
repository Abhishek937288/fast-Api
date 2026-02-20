import { Worker } from "bullmq";
import { redisConnection } from "../utils/redisConnection.js";
import User from "../models/userModel.js";
import { connectDb } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

await connectDb();

console.log("Worker started...");

const worker = new Worker(
  "onboard-users",
  async (job) => {
    try {
      console.log("Job received", job.data);

      const startTime = Date.now();
      const batchSize = job.data.batchSize;

      while (true) {
        const users = await User.find({ onboarded: false })
          .limit(batchSize)
          .lean();

        if (!users.length) break;

        const ids = users.map((u) => u._id);

        const result = await User.updateMany(
          { _id: { $in: ids } },
          { $set: { onboarded: true } },
        );
        if (result.matchedCount === 0) {
          throw new Error("No users matched for update");
        }
        console.log(`Updated ${result.modifiedCount} users`);

        await new Promise((r) => setTimeout(r, 300));
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log("All users onboarded");

      return {
        completedAt: new Date(),
        timeTaken: totalTime,
      };
    } catch (error) {
      console.log("Processor error:", error.message);

      // THIS IS IMPORTANT
      throw error; // 🔥 this tells BullMQ job failed
    }
  },
  { connection: redisConnection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("error", (err) => {
  console.log("Worker crashed:", err.message);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed`);
  console.log("Error:", err.message);
});
