import { selectMidiDevice } from "../midi_browser/home_modules/midi/MidiRegister.js";
import { interpretRowId, getSetPartial } from "../toneView/toneView.js";
import {identifyInput} from "./BCR_tone.js";
/*  B-Control BCR-2000 as an 'in app' assignable controller. */

const ASSIGN_BUTTON = 91, //CC 91
     UNASSIGN_BUTTON = 92,
     ON = 127,
     OFF = 0,
     debug = true;

var BCR_callback;

function getMIDIMessage(message) {
     var command = message.data[0];
     var note = message.data[1];
     var velocity = message.data.length > 2 ? message.data[2] : 0;
     if (message.target.name === "BCR2000") {
          // add BCR callback.
          BCR_callback(command, note, velocity);
     }
}

/*  getMidiAccess grants MidiAccess
 and makes it receive all midi device output, but send midi only
 on midiDeviceNameOrId. 
 */
async function getMidiAccess(midiDeviceNameOrId) {
     let midiOuts = {};
     let midiAccess = await navigator.requestMIDIAccess();
     console.log(midiAccess);
     const outputs = midiAccess.outputs.values();
     for (const output of outputs) {
          midiOuts[output.name] = output;
     }
     for (var input of midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
     }
     var midiout = selectMidiDevice(midiOuts, midiDeviceNameOrId);
     return midiout;
}

var BCR = {
     name: "BCR_Assigner",
     waitingForAssignment: false,
     assignments: {},
     identifyInput: identifyInput,
     nextCallback: (value) => console.log("Blank Callback. Value " + value),
     addAssignment: function (ccNumber, callback) {
          console.log(lastClickedElement.tagName);
          
          let element=lastClickedElement;
          let customCallback = identifyInput(element);
          
          if (Array.isArray(customCallback)){
               let initializeValue=customCallback[1];
               customCallback=customCallback[0];
               this.sendCC(ccNumber, initializeValue); 
          }
          console.log(callback, "sent")
          this.assignments[ccNumber] = customCallback;
     },

     sendCC: function (ccNumber, value) {
          if (this.midi) {
               this.midi.send([176, ccNumber, value]);
          } else {
               console.log("BCR Midi not present.");
          }
     },
     ccData: function (command, controller, value) {
          console.log(this);
          let midiOther = document.getElementById("note");
          let message = `Controller# ${controller} :  ${value}`;
          midiOther.textContent = message;
          this.checkCCs(controller, value);
          if (this.assignments[controller]) {
               this.assignments[controller](value);
          }
     },
     checkCCs: function (controller, value) {
          /* When ASSIGN_BUTTON is on
          wait for next dial...
          assign next dial to function...
           */
          if (                     /* Assignment button switched on... */
          controller === ASSIGN_BUTTON && value === ON) {
               this.waitingForAssignment = true;
               console.log(`ASSIGN ON, waiting = ${this.waitingForAssignment}`);
          
          } else if (               /* Waiting for assignment  */
               this.waitingForAssignment === true &&
               controller !== ASSIGN_BUTTON
          ){
               this.addAssignment(controller, this.nextCallback);
               this.waitingForAssignment = false;
               this.sendCC(ASSIGN_BUTTON, OFF);
               
               console.log(`assignment made? ${this.assignments[controller]}`);
          }
     },
};

var lastClickedElement;

function changeInput(){

}


function BCR_Assign() {
     document.body.addEventListener('click', (e)=>{lastClickedElement=e.target}, false);

     // initialize it
     getMidiAccess("BCR2000").then((midiout) => {
          console.log(midiout);
          // midiout.send([176, 91, 0]); longForm...
          BCR.midi = midiout;
          BCR.sendCC(ASSIGN_BUTTON, OFF);

          // assign callback for BCR
          BCR_callback = BCR.ccData.bind(BCR);
          //  BCR.checkCCs.bind(BCR);
          console.log("after access", BCR);
     });

     return BCR;
}

//const turnOffAssignmentButton = ()=>

export { BCR_Assign };
