const express = require('express')
const crypto = require('node:crypto') // biblioteca nativa de node, para genera id random
const cors = require('cors')
const app = express()
const movies = require('./movies.json')
const { validacionCreateMovie, validacionUpdateMovie } = require('./schemas/schema')

const port = process.env.PORT || 3000

app.use(cors({ // ver documentacion de cors
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://127.0.0.1:35953',
      'http://127.0.0.1:8080',
      'http://movies.com']

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    callback(new Error('Problamas de Cors'), false)
  }
})) // lo que hace por defecto es poner todos las cabeceras con (*)
app.disable('x-powered-by') // Desabilita el header x-powered-by que por defecto pone express
app.use(express.json()) // opter los datos que vengan del req.body

/*
  Nota: cors es basicamente falta de cabeceras (headers)
  Dejar cors() con su configuracion por defecto de funcionar funciona
  pero no siempre se quier dar permiso a todo
*/

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (!genre) {
    res.status(200).json(movies)
  } else {
    const moviesGenre = movies.filter(movie =>
      // tolowerCase se usa para compara los generos todo en minuscula
      movie.genre.some(genres => genres.toLowerCase() === genre.toLocaleLowerCase()))

    if (moviesGenre.length > 0) return res.status(200).json(moviesGenre)
    res.status(404).json({ message: 'Genre Not Found' })
  }
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params

  const pelicula = movies.filter(movie => movie.id === id)
  if (pelicula.length > 0) return res.status(200).json(pelicula)

  res.status(404).json({ message: 'Not Found' })
})

// Nota: al consumir un post desde el front se manda en el header el Content-Type:
/* En el metodo Post, nunca se pide el id por body, este se debe crear autimaticamente */

app.post('/movies', (req, res) => {
  const resultado = validacionCreateMovie(req.body)

  if (!resultado.success) {
    return res.status(400).json({ error: JSON.parse(resultado.error.message) })
  }

  // Esto va se realiza en la base de datos
  const idNewMovie = crypto.randomUUID()// para simulara el id autoIncrement de un base de datos
  const newMovie = { id: idNewMovie, ...resultado.data }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

/* Para hacer una actualizacion se puede usar put o patch
  put: se debe mandar todos los datos a si solo se queiera modificar solo uno
  patch: se debe mandar solo el dato que se quiere modificar
*/

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const resultado = validacionUpdateMovie(req.body)

  const pelicula = movies.find(movie => movie.id === id)
  if (!pelicula) {
    return res.status(404).json({ message: 'Pelicula not found' })
  } else if (!resultado.success) {
    return res.status(400).json({ error: JSON.parse(resultado.error.message) })
  }

  const peliculActulizado = { ...pelicula, ...resultado.data }

  return res.status(200).json(peliculActulizado)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie delete' })
})

app.listen(port, () => {
  console.log('Escuchando en el puerto: http://localhost:' + port)
})
