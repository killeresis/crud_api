const { createClient } = require('@supabase/supabase-js');
const { supabase } = require('../supabase');

/**
 * Auth guard — verifies Bearer JWT with Supabase, then attaches req.user
 * (and req.accessToken for logout). Reuse on any protected route.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/** Client scoped to the caller's JWT — used for signOut */
function userClientFromToken(token) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

module.exports = { requireAuth, userClientFromToken };
