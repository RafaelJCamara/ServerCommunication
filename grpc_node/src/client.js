const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')

const protoObject = protoLoader.loadSync(path.resolve(__dirname, '../proto/notes.proto'))
const NotesDefinition = grpc.loadPackageDefinition(protoObject)

const client = new NotesDefinition.NoteService('localhost:50051', grpc.credentials.createInsecure())

client.list({}, (err, notes) => {
  if (err) throw err
  console.log(notes)
})

client.find({ id: 2 }, (err, { note }) => {
  if (err) return console.error(err.details)
  if (!note) return console.error('Not Found')
  return console.log(note)
})

client.AddNote({ note:{id: 3, title:"Third note", description: "The third note"} }, (err, responseMessage) => {
    if (err) return console.error(err.details)
    return console.log(responseMessage)
  })

client.list({}, (err, notes) => {
if (err) throw err
console.log(notes)
})