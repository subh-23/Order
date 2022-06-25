const ROLE = require("./roles")

//Admin has all the permissions to access all the data
function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== ROLE.ADMIN) {
      res.status(401)
      return res.send("You've no permissions")
    }
    next()
  }
}
module.exports = { authRole } 