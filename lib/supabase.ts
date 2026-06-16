import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zxkmppimtglyqkinjpbr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a21wcGltdGdseXFraW5qcGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzIzODEsImV4cCI6MjA5NzIwODM4MX0.6Axh7ZUT2sZoQL80yB_9K0GT1z89l1qUsux44Sn5SME";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
