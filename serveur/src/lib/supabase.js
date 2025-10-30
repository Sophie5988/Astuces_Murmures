// serveur/src/lib/supabase.js
// ============================================================================
// Client Supabase côté serveur (pour déplacer draft/ -> actualites/)
// - Nécessite SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// - Si absent : exporte null, et le controller fait un fallback propre
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

let supabaseServer = null;
if (url && serviceKey) {
  supabaseServer = createClient(url, serviceKey);
}

export default supabaseServer;
