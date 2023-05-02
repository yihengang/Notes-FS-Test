const notesRouter = require("express").Router()
const Note = require("../models/note")

notesRouter.get("/", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

notesRouter.get("/:id", (request, response, next) => {
  //using Mongoose's findById method
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

notesRouter.post("/", (request, response, next) => {
  const noteFromBody = request.body

  //this conditional statement not included in the course note
  if (noteFromBody.content === undefined) {
    return response.status(400).json({ error: "content missing" })
  }

  const newNote = new Note({
    content: noteFromBody.content,
    important: noteFromBody.important || false,
  })

  newNote
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

notesRouter.delete("/:id", (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

notesRouter.put("/:id", (request, response, next) => {
  const { content, important } = request.body

  // const note = {
  //   content: body.content,
  //   important: body.important,
  // };

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

module.exports = notesRouter
