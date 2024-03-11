const JWT = {
  jwt: process.env.JWT_SECRET || 'this-is-dog-dick',
  jwtExp: '1d',
}
module.exports = {JWT}
