import { createClient } from "@supabase/supabase-js";
import "dotenv/config"

//create supabase object to use supabase SQL operations: insert,select,delete,update

export const supabase = await createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
)
