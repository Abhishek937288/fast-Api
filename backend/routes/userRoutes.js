import { Router } from "express";   
import { addUsers, getJobStatus, onboardUsers } from "../controller/userController.js";

const router = Router();

router.post("/", addUsers);
router.patch("/",onboardUsers);
router.get("/job-status/:jobId", getJobStatus);

export default router;