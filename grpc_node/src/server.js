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

/*Unary operations*/
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

/*Server streaming*/
function ListStream(call, callback){
  console.log("*********")
  console.log("Received a request to list notes as a server stream.");
  console.log("*********")
  for(let i=0;i!=notes.length;i++){
    let currentNote = notes[i]; 
    call.write({note:currentNote});
  }
  call.end();
}

/*Client streaming*/
function AddNoteStream(call, callback){
  console.log("*********")
  console.log("Received a request to add notes as from a client stream.");
  console.log("*********")
  call.on('data',function(note){
    console.log(`Received: ${note.note}`)
    notes.push(note.note);
  });
  
  call.on('end',function(){
    console.log("*********")
    console.log('All Notes have been received.');
    console.log("*********")
    return callback(null, {
      responseMessage:"All notes have been added to the database.",
      note:notes
    });
  });
}

//grpc server
const server = new grpc.Server()

//register services
server.addService(NotesDefinition.NoteService.service, { List, Find, 
                                                        AddNote, ListStream,
                                                        AddNoteStream})

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
server.start()
console.log('Listening')