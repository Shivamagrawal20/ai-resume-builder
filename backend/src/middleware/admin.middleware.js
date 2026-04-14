/** Requires `requireAuth` first — uses `req.user.isAdmin` from the database. */

export function requireDbAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
