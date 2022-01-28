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

/*Server stream calls*/
let streamCall = client.ListStream({});
streamCall.on('data',function(response){
  console.log(response);
});

streamCall.on('end',function(){
  console.log('All Notes have been sent.');
});

/*Client stream calls*/
let clientStreamCall = client.AddNoteStream((err, response)=>{
    if(err) return console.error(err.details);
    console.log(`Message received from the server:\n ${response.responseMessage}`);
});

for(let i=1;i!=5;i++){
    clientStreamCall.write({note:{
        id:i,
        title:`Title number ${i}`,
        description: `Description number ${i}`
    }});
}
clientStreamCall.end();

client.list({}, (err, notes) => {
if (err) throw err
console.log(notes)
})