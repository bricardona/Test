// Create a client instance
client = new Paho.MQTT.Client("broker.mqttdashboard.com", 8000, "clientId-1234");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});


// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("World");
  message = new Paho.MQTT.Message("Hello");
  message.destinationName = "indoor";
  client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
}

function SendMessage() {
  var topic = document.getElementById('topic').value;
  var text = document.getElementById('message').value;
  message = new Paho.MQTT.Message(text);
  message.destinationName = topic;
  client.send(message); 
}