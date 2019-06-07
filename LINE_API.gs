var LINEToken = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN');

function postMessage(message){
  var options = {
    'method' : 'post',
    'headers': {
      'Authorization': 'Bearer ' + LINEToken
    },
    'payload' : {
      'message': message
    }
  };
  var response = UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
}

function postImage(message, img){
  var formData = {
   'message' : message,
   'imageFile': img
  }
  var options = {
     "method"  : "post",
     "payload" : formData,
     "headers" : {
       "Authorization" : "Bearer "+ LINEToken
     }
   };

   UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}