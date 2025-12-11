export function whoAmI(req, res) {
  return res.json({ user: req.user, error: req.tokenError });
}

export function login(req, res) {
  res.send("Login endpoint");
}
