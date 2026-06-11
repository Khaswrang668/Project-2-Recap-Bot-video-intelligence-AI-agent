// Extracts audio from video file
// Send audio binary stream in buffer to OpenAI whishper to get text file of audio
// Chunk the text file
// Store in pg-vector supabase

import { asyncHandler } from "../utils/asyncHandler.js";
import Ffmpeg from "fluent-ffmpeg";

