function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}

module.exports = isAdmin;
