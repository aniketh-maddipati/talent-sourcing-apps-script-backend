/********************OBJECT AND ARRAY FUNCTIONS ********************************************/
//converts google sheets data which comes as an Array as 'values' into a JSON object
function JSONify(values, headings) {
    //remove column headers
    values.unshift(headings)
    var finalJSONArray = [];
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
      finalJSONArray.push(obj);
    }
    return JSON.stringify(finalJSONArray)
  }
  
  //sorts JSON in alphabetical order by keys
  function sortJSON(not_sorted) {
      Logger.log(Object.keys(not_sorted)
          .sort()
          .reduce(function(acc, key) {
              acc[key] = not_sorted[key];
              return acc;
          }, {}))
  }
  
  //converts JSON input to Array that can be appended as a row to the google sheet
  function Arrayify(candidateInformation) {
    return Object.keys(candidateInformation).sort().map(function(key) { return candidateInformation[key] })
  }
  
  /******************************************************************************************/
  /* tower: entity representing groups of users where each have their own separate sheet in the workbook. 
  Comes from the idea that the group consists of employees at all levels from junior engineers up to managers*/

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
  
  //add a new candidate to the google sheets
  function postCandidateToTower(tower, candidateInformation) {
    candidateInformation.createdTimestamp = (new Date()).toString()
    candidateInformation.updatedTimestamp = (new Date()).toString()
    var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
    var candidateRow = searchForCandidateInTower(tower, candidateInformation); // returns -1 if candidateRow does not exist
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
  
  function searchForCandidateInTower(tower, candidateInformation) {
    //Search for a candidate based on their candidate sourceURL
    var sheet = SpreadsheetApp.openById('15tmFFgxFAePKe4qQL1_uaJIhXErVXtTunsHG6yIt2UU').getSheetByName(tower);
    //gets the coordinates corresponding to all the of the data (ie. A1:O16)
    var range = sheet.getDataRange();
    // Creates  a text finder to search for the intended string within the range
    var textFinder = range.createTextFinder(candidateInformation.sourceURL);  
    //finds the first occurrence of that string and return the row that it is in
    var firstOccurrence = textFinder.findNext(); //will return null if row does not exist
    return firstOccurrence ? (Number(firstOccurrence.getRowIndex().toString())) : -1
  }