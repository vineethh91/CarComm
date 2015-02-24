
var charBits = require("./charBits");
var mraa = require("mraa");

// SERIAL DATA IN
var shiftInPort = new mraa.Gpio(13);
shiftInPort.dir(mraa.DIR_OUT);

// DATA shift in CLK
var shiftClkPort = new mraa.Gpio(12);
shiftClkPort.dir(mraa.DIR_OUT);

// STORAGE register CLK
var storageClkPort = new mraa.Gpio(8);
storageClkPort.dir(mraa.DIR_OUT);

// MASTER RESET -- active LOW
var resetPort = new mraa.Gpio(7);
resetPort.dir(mraa.DIR_OUT);

periodicActivity();

var printMessage = true;
var resetBoard = false;
var receivedMessage = false;
var loopCount = 0;

var messageToBePrinted = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function periodicActivity() {
    resetShiftRegisters();
    setTimeout(mainLoop, 1000);
}

function resetShiftRegisters() {
    console.log("Resetting the board");
    console.log("Waiting for messages");
    resetPort.write(0);
    delay(100);
    resetPort.write(1);      
}

function mainLoop() {
  if(printMessage) {
    shiftOutString(messageToBePrinted); 
    printMessage = false;
    //ledState = !ledState;    
  } else if(resetBoard) {
    resetShiftRegisters();
    resetBoard = false;
  } 

//  if (loopCount < 10) {
    loopCount++;
    setTimeout(mainLoop, 0);
//    delay(10);
//  }
}

function shiftOutString(stringToBeShifted) {
    console.log("Message being shifted out : " + stringToBeShifted); 
    for(var i = 0; i < stringToBeShifted.length; i++) {
        shiftOutAlphabet(stringToBeShifted[i]);
	delay(300);	
    }
}

function shiftOutAlphabet(alphabetToBeShifted) 
{
    console.log("Alphabet within message being shifted out : " + alphabetToBeShifted); 
    asciiArrayToBeShifted = charBits[alphabetToBeShifted.toUpperCase()];
    shiftOutAsciiArray(asciiArrayToBeShifted);
}

function shiftOutAsciiArray(asciiArrayToBeShifted) 
{
    for(var i = 0; i < asciiArrayToBeShifted.length; i++) {
        //console.log("columnOfAlphabetBeingShifted : " + asciiArrayToBeShifted[i].toString(2));    
        shiftOutByte(asciiArrayToBeShifted[i]);
        //delay(10000);
    }
}

function shiftOutByte(byteToBeShifted) 
{
    //console.log("shifting out byte " + byteToBeShifted.toString(2));
    writeBit((byteToBeShifted & 0x80) >> 7);
    writeBit((byteToBeShifted & 0x40) >> 6);
    writeBit((byteToBeShifted & 0x20) >> 5);
    writeBit((byteToBeShifted & 0x10) >> 4);
    writeBit((byteToBeShifted & 0x08) >> 3);
    writeBit((byteToBeShifted & 0x04) >> 2);
    writeBit((byteToBeShifted & 0x02) >> 1);
    writeBit(byteToBeShifted & 0x01);
    clockStorageRegister();
}

function writeBit( bit ) {
    //console.log("writing bit " + bit + " onto the shift register");
    //put data on the line
    shiftInPort.write( bit );
    //positive clk edge 
    shiftClkPort.write( 1 );
    //pull down clk to latch the bit
    shiftClkPort.write( 0 );
    clockStorageRegister();
}

function clockStorageRegister() {
    //console.log("ClockingStorageRegister");
    //positive clk edge 
    storageClkPort.write( 1 );
    //pull down clk
    storageClkPort.write( 0 );
}

function delay(ms) {
   //console.log("Delaying for " + ms + " milliseconds");
   ms += new Date().getTime();
   while (new Date() < ms){}

}

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port:8080})

wss.on('connection', function(ws) {
  ws.on('message', function(data) {
    console.log('Received message from Android device : %s', data);
    var message = JSON.parse(data);
    if("push" in message) {
      messageToBePrinted = message["push"];
      printMessage = true;
    } else if("clear" in message) {
      resetBoard = true;
    }
    receivedMessage = true;
  });

  //console.log('hit asshole');
  ws.send('RECEIVED YOUR FUCKING MESSAGE DICKWAD <3');
});

/*wss.on('message', function(data, flags) {
  console.log(data);
});*/ 

