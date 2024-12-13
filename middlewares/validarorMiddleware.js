// eslint-disable-next-line no-unused-vars
const z = require('zod') // libreria para hacer validacion de schemas

function validatorSchema (schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      next(result.error)
    //   return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    res.data = result.data
    next()
  }
}

module.exports = { validatorSchema }
