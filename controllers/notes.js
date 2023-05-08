const notesRouter = require("express").Router()
const Note = require("../models/note")
const mongoose = require("mongoose")

// const note = new Note({
//   content: "Cason is going to finish chapter four before heading back",
//   important: true,
// })

// note.save().then((result) => {
//   console.log("note saved!")
//   console.log(result)
//if connection not closed, program will never finish its execution
// mongoose.connection.close()
// })

notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

notesRouter.get("/:id", async (request, response, next) => {
  //using Mongoose's findById method
  try {
    const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

notesRouter.post("/", async (request, response, next) => {
  const noteFromBody = request.body

  //this conditional statement not included in the course note
  if (noteFromBody.content === undefined) {
    return response.status(400).json({ error: "content missing" })
  }

  const newNote = new Note({
    content: noteFromBody.content,
    important: noteFromBody.important || false,
  })

  try {
    const savedNote = await newNote.save()
    response.status(201).json(savedNote)
  } catch (exception) {
    next(exception)
  }
})

notesRouter.delete("/:id", async (request, response, next) => {
  try {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
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
