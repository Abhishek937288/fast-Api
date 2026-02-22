import { Router } from "express";   
import { addUsers, updateUsers,  } from "../controller/userController.js";

const router = Router();

router.post("/", addUsers);
// // router.patch("/",onboardUsers);
// router.get("/job-status/:jobId", getJobStatus);
router.patch("/" , updateUsers)

export default router;