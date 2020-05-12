/*
 * BIPAP BLOWER
 * 
 * GUI with Pressure Sensor and Blower regulation
 * 
 */

// Required modules for GUI
var express = require('express');   

// Express with Handlebars template engine
var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout:'main'
});

// Required libraries for pressure sensor
const i2c = require('i2c-bus');
const Gpio = require('onoff').Gpio;

// Set up express to use handlebars and appropriate PORT
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9055);

// Set public folder
app.use(express.static('public'));

// Set up for potentiometer read
const spi = require('spi-device');
var device;

// Address of ADC
const ADDR = 0x48;

// Buffer variables
var rbuf = Buffer.alloc(2);							// hold data read from ADC
var w_config = Buffer.from('018483', 'hex');		// Initial config (from datasheet - demo data)
var w_pointer = Buffer.from('00', 'hex');			// Pointer to conversion register
//var ss_w_config = Buffer.from('018589', 'hex');	// Initial config - my setup
var ss_w_config = Buffer.from('01c589', 'hex');		// Initial config - my setup

var lowthres_reg = Buffer.from('020000', 'hex');	// Low threshold register config for ALERT/RDY pin
var hithres_reg = Buffer.from('038000', 'hex');		// High threshold register config for ALERT/RDY pin

// Interrupts
const alertRdy = new Gpio(17, 'in', 'rising');

// Open I2C communication on I2C-1
const i2cl = i2c.openSync(1);

// Configure registers on ADC
i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);		// Write initial config
i2cl.i2cWriteSync(ADDR, lowthres_reg.length, lowthres_reg);		// Config low threshold register
i2cl.i2cWriteSync(ADDR, hithres_reg.length, hithres_reg);		// Config high threshold register
i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);

// Root
app.get('/',function(req,res,next){
	context = {};
	res.render('index', context);
});

// Start Pressure Sensor & Blower Regulation
app.post('/start',function(req,res,next){

	// Pressure calculation variables
	var voltOut = 0;
	const SUPPLY_VOLTAGE = 5.0;
	var curPres = 0;
	var prevPres = 0;
	var maxPres = 0;
	var minPres = 0;
	var lowChange = false;
	var highChange = false;

	device = spi.openSync(0, 0);

	// Threshold to detect change in pressure
	var threshold = 0.2;

	// Watch for new pressure read
	alertRdy.watch((err, value) => {
		if (err) throw err;

		// Read into buffer
		i2cl.i2cReadSync(ADDR, rbuf.length, rbuf);
		voltOut = ( rbuf.readInt16BE() / 65535 ) * SUPPLY_VOLTAGE;

		curPres = ( ( voltOut / SUPPLY_VOLTAGE ) - 0.5 ) / 0.2;
		//console.log(curPres + " kPa");

		// Pressure is decreasing
		if (curPres < prevPres) {
			minPres = curPres;

			// If it has decreased from the max by more than the threshold
			if ((Math.abs(maxPres - curPres) > threshold) && !lowChange)
			{
				// console.log('------------------------');
				// console.log('Turn off blower');
				// console.log('Pressure: ' + curPres + ' kPa');

				// Turn off blower
				device.transferSync([{
					byteLength: 1,
					sendBuffer: Buffer.from([0x00]),
				}]);

				lowChange = true;
				highChange = false;
			}
		}	
		// Else if pressure is increasing
		else if (curPres > prevPres) {
			maxPres = curPres;

			// If it has increased from the min by more than the threshold
			if ((Math.abs(minPres - curPres) > threshold) && !highChange)
			{
				// console.log('------------------------');
				// console.log('Turn on blower');
				// console.log('Pressure: ' + curPres + ' kPa');

				// Turn on blower
				device.transferSync([{
					byteLength: 1,
					sendBuffer: Buffer.from([0xff]),
				}]);

				highChange = true;
				lowChange = false;
			}

		}

		// Move current pressure into previous for next count
		prevPres = curPres;

		// Rewrite config register to have OS bit high
		// to trigger another read
		i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);
		i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);
	});

});

// Stop Pressure Sensor & Blower Regulation
app.post('/stop',function(req,res,next){

	// Turn off blower if it is on
	device.transferSync([{
		byteLength: 1,
		sendBuffer: Buffer.from([0x00]),
	}]);

	alertRdy.unwatch();
	device.closeSync();
});

// 404 Page Not Found Error
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// 500 Server Error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

// Start the app
app.listen(app.get('port'), function(){
  console.log('Express started; press Ctrl-C to terminate.');
});

