/*
POTENTIOMETER TEST
A brief program to test the digital potentiometer
*/

// Set up SPI communication
const spi = require('spi-device');
var device = spi.openSync(0, 0);


function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

// Set to low
device.transferSync([{
	byteLength: 1,
	sendBuffer: Buffer.from([0x00]),
}]);

sleep(5000);

// Close connection
device.closeSync();
