const z = require('zod') // libreria para hacer validacion de schemas

// .partial: vuelve todas la propiedades del schema opcionales

/* .safeParse: si el objeto cumple con el shcema retona un obje
    {success : true ,data:T} y si no retorna {success : false ,error:zodError}
  */

const movieSchema = z.object({
  title: z.string({
    required_error: 'titel is required',
    invalid_type_error: 'title must be a string'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string({
    required_error: 'dierctor is required',
    invalid_type_error: 'director must be string'
  }),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).optional(),
  poster: z.string().url(),
  genre: z.array(z.enum(['Drama', 'Action', 'Crime', 'Sci-F', 'Adventure', 'Romance', 'Animation'],
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be in array string'
    }))
})

function validacionCreateMovie (object) {
  return movieSchema.safeParse(object)
}

function validacionUpdateMovie (object) {
  return movieSchema.partial().safeParse(object)
}
module.exports = { validacionCreateMovie, validacionUpdateMovie }
