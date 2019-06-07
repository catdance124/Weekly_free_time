var calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');

function convertDateToString(date){
  var str = ('00'+(date.getMonth()+1)).slice(-2)+'/'+
            ('00'+date.getDate()).slice(-2);  // string 'MM/dd' format
  return str
}

function convertTimeToString(date){
  var str = ('00'+date.getHours()).slice(-2)+':'+
            ('00'+date.getMinutes()).slice(-2);  // string 'hh/mm' format
  return str
}

function getEventsDic(n_days){
  // get events from calendar
  var startDate=new Date(2019,5,10);
  startDate.setHours(0);
  var endDate=new Date(2019,5,10);
  endDate.setHours(0);
  endDate.setDate(endDate.getDate()+n_days);
  var calendar = CalendarApp.getCalendarById(calendarId);
  var events = calendar.getEvents(startDate,endDate);
  
  // create events dictionary
  var eventsDic = {}
  events.forEach(function(event){
    var eventTitle = event.getTitle()
    var eventStartTime = event.getStartTime();
    var eventEndTime = event.getEndTime();
    var eventDateStr = convertDateToString(eventStartTime);
    if (!eventsDic[eventDateStr]){ eventsDic[eventDateStr] = []; }
    eventsDic[eventDateStr].push(event);
  });
  return eventsDic;
}

function calcFreeTime(n_days, eventsDic){
  var freeTimeForDay = {};
  for (var i=0; i<n_days; i++){
    var date = new Date(2019,5,10);
    date.setDate(date.getDate()+i);
    date.setHours(8);
    date.setMinutes(30);  // initialize 08:30
    var eventDateStr = convertDateToString(date);
    freeTimeForDay[eventDateStr] = {};
    if (eventsDic[eventDateStr]){
      eventsDic[eventDateStr].forEach(function(event){
        var eventStartTime = event.getStartTime();
        var eventEndTime = event.getEndTime();
        var diffMinutes = Math.ceil((eventStartTime.getTime() - date.getTime()) / (1000*60));
        // if date <-- 20 minutes --> eventStartTime  >> add
        if (diffMinutes > 20){
          freeTimeForDay[eventDateStr][convertTimeToString(date)+'~'+convertTimeToString(eventStartTime)] = diffMinutes;
        }
        date = eventEndTime;  // replace
      });
    }
    var limit = new Date(2019,5,10);
    limit.setDate(limit.getDate()+i);
    limit.setHours(18);
    limit.setMinutes(59);  // initialize 18:59
    var diffMinutes = Math.ceil((limit.getTime() - date.getTime()) / (1000*60));
    // if date <-- 20 minutes --> limit  >> add
    if (diffMinutes > 20){
      freeTimeForDay[eventDateStr][convertTimeToString(date)+'~'+convertTimeToString(limit)] = diffMinutes;
    }
  }
  return freeTimeForDay;
}

function main(){
  var n_days = 5;
  var eventsDic = getEventsDic(n_days);
  var freeTimeForDay = calcFreeTime(n_days, eventsDic);
  var text = '';
  var sumForWeek = 0;
  for (dayKey in freeTimeForDay){
    text += '=====' + dayKey + '=====\n';
    var sumForDay = 0;
    for (timeKey in freeTimeForDay[dayKey]){
      text += timeKey + '\n';
      sumForDay += freeTimeForDay[dayKey][timeKey]
    }
    var h = Math.floor(sumForDay/60);
    var m = sumForDay % 60;
    text += 'Available: '+h+'h, '+m+'m'+'\n';
    sumForWeek += sumForDay;
  }
  text += '==== Weekly ====\n';
  var h = Math.floor(sumForWeek/60);
  var m = sumForWeek % 60;
  text += 'Available: '+h+'h, '+m+'m';
  postMessage(text);
}