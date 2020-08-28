/********************OBJECT AND ARRAY FUNCTIONS ********************************************/
//TEST OF CHROME EXTENSIONS
//done
function JSONify(values, headings) {
  values.unshift(headings)
  var result = [];
  var headers = values[0]
  var cols = headings.length;
  var row = [];
  var obj = {};
 
  for (var i = 1, l = values.length; i < l; i++) {
    // get a row to fill the object
    row = values[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) {
      // fill object with new values
      obj[headers[col]] = row[col];
    }
    // add object in a final result
    result.push(obj);
  }
  return JSON.stringify(result)
}

//done
function sortJSON(not_sorted) {
    Logger.log(Object.keys(not_sorted)
        .sort()
        .reduce(function(acc, key) {
            acc[key] = not_sorted[key];
            return acc;
        }, {}))
}

//done
function Arrayify(candidateInformation) {
  return Object.keys(candidateInformation).sort().map(function(key) { return candidateInformation[key] })
}

/******************************************************************************************/

/*-----------------------------------CANDIDATE FUNCTIONS-----------------------------------*/

function getAllCandidatesFromTower(tower) {
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  var values = sheet.getDataRange().getValues();
  var headings = values[0]
  values.splice(0, 1)
  return JSONify(values, headings)
}

function getOneCandidateFromTower(tower, candidateInformation) {
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  var candidateRow = searchForCandidateInTower(tower, candidateInformation);
  var headings = sheet.getDataRange().offset(0, 0, 1).getValues()[0];
  try {
    //checks if candidate exists; else throws and error
    if (candidateRow) {
      //returns a JSON of the row with the candidate information by finding the range that row
      var values = sheet.getRange(candidateRow, 1, 1, 17).getValues()[0]
      return JSONify([values], headings)
    } else {
      //if candidate doesnt exist in table then tell the user that the candidate doesnt exist
      throw {message: 'CANDIDATE DOES NOT EXIST'}
    }
  } catch (error) {
    return JSON.stringify(error)
  }
}

//this is the final version once we can pass candidate info object to Candidate Information
function postCandidateToTower(tower, candidateInformation) {
  candidateInformation.createdTimestamp = (new Date()).toString()
  candidateInformation.updatedTimestamp = (new Date()).toString()
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  var candidateRow = searchForCandidateInTower(tower, candidateInformation);
  try {
    if (candidateRow < 0) {
      sheet.appendRow(Arrayify(candidateInformation))
      return JSON.stringify(candidateInformation)
    } else {
      throw {message: 'CANDIDATE ALREADY EXISTS'}
    }
  } catch (error) {
    return JSON.stringify(error)
  }
}


//done
function editCandidate(tower, candidateInformation) {
  //candidateInformation.updatedTimestamp = (new Date()).toString()
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  var candidateRow = searchForCandidateInTower(tower, candidateInformation);
  try {
    //checks if candidate exists; else throws and error
    if (candidateRow > 0) {
      //gets the range of the row containing the candidates info and sets that row to a new array of values
      sheet.getRange(candidateRow, 1, 1, 17).setValues([Arrayify(candidateInformation)])
      return JSON.stringify(candidateInformation)
    } else {
      //if candidate doesnt exist in table then tell the user that the candidate doesnt exist
      throw {message: 'CANDIDATE DOES NOT EXIST'}
    }
  } catch (error) {
    return JSON.stringify(error)
  }
}

//done
//edits candidate status ie. from 'Not Contacted' to 'Contacted'
function setCandidateStatus(tower, candidateInformation, newStatus) {
  //updates status of candidate. ie. "Not Contacted" to "Contacted"
    var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
    var candidateRow = searchForCandidateInTower(tower , candidateInformation);
    Logger.log(candidateRow)
    sheet.getRange('O' + candidateRow).setValue(String(new Date()))
    sheet.getRange('M' + candidateRow).setValue(String(newStatus))
    return JSON.stringify({message: 'CHECK SHEET'})
}

//done
//deletes one row from the tower table
function deleteOneCandidateFromTower(tower, candidateInformation) {
  //delete a specific Candidate based on their sourceURL
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  var candidateRowNumber = searchForCandidateInTower(tower, candidateInformation);
  return candidateRowNumber ? (sheet.deleteRow(candidateRowNumber) , 'CHECK SHEET') : ('CANDIDATE DOESNT EXIST')
}

//done
function searchForCandidateInTower(tower, candidateInformation) {
  //Search for a candidate based on their candidate sourceURL
  var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
  //gets the coordinates corresponding to all the of the data (ie. A1:O16)
  var range = sheet.getDataRange();
  // Creates  a text finder to search for the intended string within the range
  var textFinder = range.createTextFinder(candidateInformation.sourceURL);  
  //finds the first occurrence of that string and return the row that it is in
  var firstOccurrence = textFinder.findNext();
  return firstOccurrence ? (Number(firstOccurrence.getRowIndex().toString())) : -1
}
/*-----------------------------USER TABLE INTERACTIONS-------------------------------------*/
function getAllUsers() {
  var sheet = SpreadsheetApp.openById('1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo').getSheetByName('Users');
  var values = sheet.getDataRange().getValues();
  var headings = values.splice(0, 1)[0] 
  return JSONify(values, headings)
}

function getOneUser(userInfo) {
  var userRow = searchForUser(userInfo.email || userInfo);
  // Logger.log(userRow)
  console.log('userRow is ' + userRow)
  var sheet = SpreadsheetApp.openById('1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo').getSheetByName('Users');
  try {
    var values = sheet.getSheetValues(userRow, 1, 1, 8);
    var headings = sheet.getSheetValues(1, 1, 1, 8)[0];
    Logger.log('range: ' + values)
   
    //return userInformation
    return (JSONify(values, headings))
  } catch (error) {
    return JSON.stringify({message: error})
   // return "NO USER FOUND"
  }
}

function postUser(userInformation) {
  var userRow = searchForUser(userInformation.email);
  var sheet = SpreadsheetApp.openById("1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo").getSheetByName("Users");
  if (userRow < 0) {
    sheet.appendRow(Arrayify(userInformation));
    return JSON.stringify(userInformation);
  } else {
    return JSON.stringify({message: "The user is already registered"});
  }
}

// Might be used by the portal but the only information that can be changed is the closer boolean and tower
function putUser(userInformation) {
  var userRow = searchForUser(userInformation.email);
  var sheet = SpreadsheetApp.openById(
    "1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo"
  ).getSheetByName("Users");
  try {
    sheet.getRange(userRow, 1, 1).setValues([Arrayify(userInformation)]);
  } catch (error) {
    return JSON.parse(JSON.stringify(error))
  }
}
// Probably not gonna be used
function deleteUser(userInformation) {
  var userRow = searchForUser(userInformation.email);
  var sheet = SpreadsheetApp.openById('1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo').getSheetByName('Users');
  try {
    sheet.deleteRow(userRow);
  } catch (error) {
    return JSON.stringify(error)
  }
}

function searchForUser(email) {
  var sheet = SpreadsheetApp.openById('1huO_edah97l0IZHykiwAyoxejcBAJNoZzU51wRlwOmo').getSheetByName('Users');
  var range = sheet.getDataRange();
 
  var textFinder = range.createTextFinder(email);
  var firstOccurrence = textFinder.findNext();
  return firstOccurrence ? (Number(firstOccurrence.getRowIndex().toString())) : -1
}

/*------------------------------GMAIL FUNCTIONS---------------------------------------------*/

function reminderToContactEmail(userInformation, candidateInformation) {
  //Sends an email to the gmail of the user containing the sourceURL for that user
  GmailApp.sendEmail(userInformation.email, "Closer Reminder: Contact " + JSON.stringify(candidateInformation.candidateName), "Hello " + userInformation.name + ",\n\n" + "Don't forget to contact your candidate, " + candidateInformation.candidateName +  ". Attached is a link to the candidate's profile:\n\n" + candidateInformation.sourceURL);
  return JSON.stringify(candidateInformation.sourceURL)
}

/*---------------------------CALENDAR FUNCTIONS--------------------------------------------*/
function createCalendarReminder(candidateInformation, calendarReminder) {
  //creates a calendar event on the users calendar with a reminder to contact whoever
  var calendar = CalendarApp.createEvent("Reminder to Contact " + candidateInformation.candidateName, new Date(calendarReminder.startTime), new Date(calendarReminder.endTime))
  return JSON.stringify({message: "CHECK CALENDAR"})
}

/*------------------------------CONFIG FUNCTIONS------------------------------------------*/
function getAllTowers() {
  var sheet = SpreadsheetApp.openById('1pGJcRAznBF2ovuPS6g-dE3pJTYGE-a2EZ7tiioy5ODQ').getSheetByName('Towers');
  var values = sheet.getDataRange().getValues();
  values.splice(0, 1)
  return JSON.stringify(values)
}


function postNewTower(newTower) {
  var sheet = SpreadsheetApp.openById('1pGJcRAznBF2ovuPS6g-dE3pJTYGE-a2EZ7tiioy5ODQ').getSheetByName('Towers');
  sheet.appendRow(newTower)
  Logger.log('success');
  return JSON.stringify({message: 'SUCCESS'})
}
