/*
 * Pressure Sensor Test Average/Time
 * To test variation in pressure sensor readings over many reads, or to test elapsed time
 * */

// Number of reads to use to calculate results
const NUM_READS = 10000;

// Libraries
const i2c = require('i2c-bus');
const Gpio = require('onoff').Gpio;

// Buffer variables
var rbuf = Buffer.alloc(2);
var w_config = Buffer.from('018483', 'hex');
var w_pointer = Buffer.from('00', 'hex');

// My defaults
// var ss_w_config = Buffer.from('01c589', 'hex');
var ss_w_config = Buffer.from('01c5e9', 'hex');
var lowthres_reg = Buffer.from('020000', 'hex');
var hithres_reg = Buffer.from('038000', 'hex');

// Watch Interrupts
const alertRdy = new Gpio(17, 'in', 'rising');

// Configure registers on ADC
const ADDR = 0x48;
const i2cl = i2c.openSync(1);
i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);
i2cl.i2cWriteSync(ADDR, lowthres_reg.length, lowthres_reg);
i2cl.i2cWriteSync(ADDR, hithres_reg.length, hithres_reg);
i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);

// For pressure calculation
var voltOut = 0;
const SUPPLY_VOLTAGE = 5.0;
var pressure = 0;

function calcValue(samples) {
	return new Promise(function(resolve,reject){
		var count = 0;

		// For average
		//var sum = 0;

		alertRdy.watch((err, value) => {
			if (err) throw err;
			i2cl.i2cReadSync(ADDR, rbuf.length, rbuf);

			// For average
			//sum += rbuf.readInt16BE();

			voltOut = ( rbuf.readInt16BE() / 65535 ) * SUPPLY_VOLTAGE;
			pressure = ( ( voltOut / SUPPLY_VOLTAGE ) - 0.5 ) / 0.2;
			console.log(pressure + " kPa");

			i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);
			i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);
			
			count++;

			if(count == samples) {
				alertRdy.unwatchAll();

				// For average
				//resolve(sum/count);

				// For elapsed time
				resolve();
			}
		});
	});
}

process.on('SIGINT', _ => {
	alertRdy.unexport();
});

const time = process.hrtime();

calcValue(NUM_READS).then(function(results) {
	// For Average
	//console.log(results);

	// For elapsed time
	var elapsedTime = process.hrtime(time);
	var milliTotal = (elapsedTime[0] * 1000) + (elapsedTime[1] / 1000000);
	console.log(milliTotal / NUM_READS + " ms per sample");

}).catch(function(error){
	console.log(error);
});

