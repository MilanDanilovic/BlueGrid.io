import express from "express";
import { getFiles, getFilteredFiles } from "../controllers/file";

const router = express.Router();

router.get("/files", getFiles);
router.get("/filtered-files", getFilteredFiles);

export default router;
