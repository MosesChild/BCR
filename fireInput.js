function fireInput(el)
{
    if(document.createEventObject)
    {
        console.log('createEventObject');
        var eventObj = document.createEventObject();
        el.fireEvent("input", eventObj);
    }else if(document.createEvent)
    {
        console.log('document.createEvent');
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("input", true, true);
        el.dispatchEvent(eventObj);
    }
} 
// solution based on https://gist.github.com/callmephilip/3519403... instead fires
// a "input" event...

//useful keyCodes
// left: 37
// up : 38
// right : 39
// down : 40
// ENTER : 13

export {fireInput}