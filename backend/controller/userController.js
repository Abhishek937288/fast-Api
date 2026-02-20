import { onboardQueue } from "../queues/onboardQueue.js";

export const addUsers = async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users)) {
    res.status(400).json({ data: null, message: "not array", success: false });
  }
};

export const onboardUsers = async (req, res) => {
  const job = await onboardQueue.add("onboard-job", {
    batchSize: 1000,
  });

  res.json({
    message: "Onboarding started",
    jobId: job.id,
  });
};

export const getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = await onboardQueue.getJob(jobId);
  if (!job) {
    return res.json({ status: "Job not found" });
  }
  const state = await job.getState();

  res.json({
    jobId: job.id,
    status: state,
    result: job.returnvalue,
    failedReason: job.failedReason,
  });
};


