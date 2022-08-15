function formSubmit(){
    const Http = new XMLHttpRequest();
const url='https://api.hsforms.com/submissions/v3/integration/submit/25370084/1a5e4361-039c-4447-b193-06cff2c799a7';
Http.open("POST", url);
Http.setRequestHeader('Content-Type', 'application/json')
var data = JSON.stringify(
  {
    "submittedAt": new Date(), // This millisecond timestamp is optional. Update the value from "1517927174000" to avoid an INVALID_TIMESTAMP error.
    "fields": [
      {
        "objectTypeId": "0-1",
        "name": "email",
        "value": document.getElementById('email-e2ba').value
      },
      {
        "objectTypeId": "0-1",
        "name": "firstname",
        "value": "stuTest"
      },
      {
        "objectTypeId": "0-1",
        "name": "lastname",
        "value": "stuTest"
      },
       {
        "objectTypeId": "0-2",
        "name": "name",
        "value": "stuTest"
      },
    ],

   
  }
);

Http.send(data);

Http.onreadystatechange = (e) => {
  console.log(Http.responseText)
}
}