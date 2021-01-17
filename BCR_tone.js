import { fireInput } from "./fireInput.js";

function identifyInput(element) {
     let value = element.value,
          initializeValue = 64,
          callback;

     const regex = new RegExp(/[^0-9]/, "g");
     function note(value) {
          // read the value and convert to Note
          let visual = Tone.Frequency(value, "midi").toNote();
          element.value = visual;
          fireInput(element);
     }
     function frequency(value) {
          // read the value and convert to Frequency
          element.dataset.ccValue = value;
          let exponent = (value / 127) * 17 - 4,
               // let exponent= value / 84 -0.5 ,
               freq = Math.pow(2, exponent);
          element.value = freq;
          fireInput(element);
     }
     function beatLength(value) {
          let visual = Tone.Time((value / 127) * 2).toNotation();
          element.value = visual;
          fireInput(element);
     }
     function seconds(value) {
          let seconds = value / 10;
          element.value = seconds;
          fireInput(element);
     }
     function defaultNumber(value){
          element.value=value;
          fireInput(element);
     }
     

     /* check class first */
     console.log(element.classList);
     if (element.classList.contains("frequency")) {
          // distinguish between frequency and note.

          if (value.match(regex)) {
               // if not a pure number, handle as a note...
               initializeValue = Tone.Frequency(value).toMidi();
               callback = [note, initializeValue];

          } else {
               callback = frequency;
          }
     } else if (element.classList.contains("duration")) {
          if (value.match(regex)) {
               // if not a pure number notation or pure number (seconds)
               callback = beatLength;
          } else {
               callback = seconds;
          }
     } else {
         // try to determine

         callback = defaultNumber;
     }
     // then send callback...
     console.log("callback", callback);
     return callback;
}
export { identifyInput };
