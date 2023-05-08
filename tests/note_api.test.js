const supertest = require("supertest")
const app = require("../app.js")
const mongoose = require("mongoose")
const helper = require("./test_helper")
const Note = require("../models/note")
const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("all notes are returned", async () => {
  const response = await api.get("/api/notes")

  expect(response.body).toHaveLength(helper.initialNotes.length)
})

test("a specific note can be viewed", async () => {
  //notesinDb to drag out one specific note. Get request to specific api to see if content matches
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/)

  expect(resultNote.body).toEqual(noteToView)
})

test("a specific note is within the returned notes", async () => {
  //try using notesInDb
  const response = await api.get("/api/notes")

  const contents = response.body.map((r) => r.content)

  expect(contents).toContain("Browser can execute only JavaScript")
})

test("a valid note can be added", async () => {
  const newNote = {
    content: "Testing post",
    important: true,
  }
  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  //test if toHaveLength is the same by simply using .get and extra the response.body
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

  const contents = notesAtEnd.map((r) => r.content)
  //play around, create own array of objects and array of strings, try .toContain method
  expect(contents).toContain("Testing post")
})

test("improperly formatted note note found in list", async () => {
  const wrongNote = {
    important: true,
  }
  await api.post("/api/notes").send(wrongNote).expect(400)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

test("a note can be deleted", async () => {
  //get all initial notes
  //make an api delete on a specific id.
  //make api get/notesInDb and see if its still there, check length (should be lesser by one) and the toContain is no longer there
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

  const contents = notesAtEnd.map((r) => r.content)
  expect(contents).not.toContain(noteToDelete.content)
})

//Once all the tests finish running, close the database connection used by Mongoose
afterAll(async () => {
  await mongoose.connection.close()
})
