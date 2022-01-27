const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')

const protoObject = protoLoader.loadSync(path.resolve(__dirname, '../proto/notes.proto'))
const NotesDefinition = grpc.loadPackageDefinition(protoObject)
const notes = [
    { id: 1, title: 'Note 1', description: 'Content 1' },
    { id: 2, title: 'Note 2', description: 'Content 2' }
  ];

/**
 * Service implementations
 */

function List (_, callback) {
  console.log("Received a list service request.");
  return callback(null, { note: notes });
}

function Find ({ request: { id } }, callback) {
  console.log("Received a note find service request.");
  const note = notes.find((note) => note.id === id)
  if (!note) return callback(new Error('Not found'), null)
  return callback(null, { note })
}

function AddNote (call,callback){
  console.log("Received a request to add a note.")
  var note = call.request.note
  notes.push({id:note.id, title:note.title, description:note.description});
  let responseMessage = `Added note with ID ${note.id} successfully.`
  return callback(null, {responseMessage});
}

//grpc server
const server = new grpc.Server()

//register services
server.addService(NotesDefinition.NoteService.service, { List, Find, AddNote })

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
server.start()
console.log('Listening')