// import { onboardQueue } from "../queues/onboardQueue.js";
import { json } from "express";
import User from "../models/userModel.js";

export const addUsers = async (req, res) => {
  const students = [];
  for (let i = 1; i <= 20000; i++) {
    students.push({
      name: `Student${i}`,
      email: `student${i}@example.com`,
      onBoarded: false,
    });
  }
  try {
    const result = await User.insertMany(students, { ordered: false });
    return res.status(201).json({
      data: result,
      success: true,
      message: "users added succesfully",
    });
  } catch (err) {
    return res.status(401).json({
      data: null,
      success: false,
      message: err.message,
    });
  }
};

// export const onboardUsers = async (req, res) => {
//   const job = await onboardQueue.add("onboard-job", {
//     batchSize: 1000,
//   });

//   res.json({
//     message: "Onboarding started",
//     jobId: job.id,
//   });
// };

const processInBatches = async (batches, limit = 4) => {
  let index = 0;

  const worker = async () => {
    while (true) {
      let batchIndex;

      // atomic section
      if (index < batches.length) {
        batchIndex = index;
        index++;
      } else {
        break;
      }

      const batch = batches[batchIndex];

      await User.updateMany(
        { _id: { $in: batch } },
        { $set: { onBoarded: false } },
      );
    }
  };

  const workers = Array.from({ length: limit }, () => worker());

  await Promise.all(workers);

  return "All batches processed";
};

const chunk = (array, size) => {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};

export const updateUsers = async (req, res) => {
  try {
    // this one takes less time among all of them (around 2.351 s)
    const startTime = Date.now();
    const BATCH_SIZE = 5000;

    // 1️ Get all users whose seen = false
    const users = await User.find({ onBoarded:true }).select("_id");

    const userIds = users.map((user) => user._id);

    // 2️ Make batches of 5000
    let batches = [];
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      batches.push(userIds.slice(i, i + BATCH_SIZE));
    }

    console.log(`Total Batches: ${batches.length}`);
    console.time("Parallel Batch Update Time");

    // 3️ Run all batch updates in parallel
    await Promise.all(
      batches.map((batch) =>
        User.updateMany(
          { _id: { $in: batch } },
          { $set: { onBoarded: false } },
        ),
      ),
    );

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    res.status(200).json({
      message: "All users updated batch wise in parallel",
      timeTaken: `${totalTime} seconds`,
    });

    console.timeEnd("Parallel Batch Update Time");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
   } 
 
  // try {
  //   const startTime = Date.now();

  //   const users = await User.find({ onBoarded: true}).select("_id");

  //   const ids = users.map((u) => u._id);

  //   const batches = chunk(ids, 5000);

  //   await processInBatches(batches, 4);

  //   const totalTime = (Date.now() - startTime) / 1000;

  //   return res.status(200).json({
  //     success: true,
  //     timeTaken: totalTime,
  //   });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }

  /* try {
  //   const startTime = Date.now();
  //   const BATCH_SIZE = 5000;
  //   const PARALLEL_WORKERS = 4;

  //   const worker = async () => {
  //     while (true) {
  //       const users = await User.find({
  //         onBoarded: true,
  //         processing: { $ne: true },
  //       })
  //         .limit(BATCH_SIZE)
  //         .select("_id");

  //       if (users.length === 0) break;

  //       const ids = users.map((u) => u._id);

  //       // mark them as claimed first
  //       await User.updateMany(
  //         { _id: { $in: ids } },
  //         { $set: { processing: true } },
  //       );

  //       // now safely update
  //       await User.updateMany(
  //         { _id: { $in: ids } },
  //         {
  //           $set: { onBoarded:false},
  //           $unset: { processing: "" },
  //         },
  //       );
  //     }
  //   };

  //   // Run 4 workers in parallel
  //   await Promise.all(Array.from({ length: PARALLEL_WORKERS }, () => worker()));

  //   const endTime = Date.now();

  //   res.status(200).json({
  //     message: "Batch update completed",
  //     timeTaken: `${(endTime - startTime) / 1000} sec`,
  //   });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
   } */
};

// export const getJobStatus = async (req, res) => {
//   const { jobId } = req.params;
//   const job = await onboardQueue.getJob(jobId);
//   if (!job) {
//     return res.json({ status: "Job not found" });
//   }
//   const state = await job.getState();

//   res.json({
//     jobId: job.id,
//     status: state,
//     result: job.returnvalue,
//     failedReason: job.failedReason,
//   });
// };
