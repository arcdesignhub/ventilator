/*
 * Pressure Sensor Test
 * */

// Required libraries
const i2c = require('i2c-bus');
const Gpio = require('onoff').Gpio;

// Buffer variables
var rbuf = Buffer.alloc(2);							// hold data read from ADC
var w_config = Buffer.from('018483', 'hex');		// Initial config (from datasheet - demo data)
var w_pointer = Buffer.from('00', 'hex');			// Pointer to conversion register
//var ss_w_config = Buffer.from('018589', 'hex');	// Initial config - my setup
var ss_w_config = Buffer.from('01c589', 'hex');		// Initial config - my setup
var lowthres_reg = Buffer.from('020000', 'hex');	// Low threshold register config for ALERT/RDY pin
var hithres_reg = Buffer.from('038000', 'hex');		// High threshold register config for ALERT/RDY pin

// Watch interrupts
const alertRdy = new Gpio(17, 'in', 'rising');

// Configure registers on ADC with I2C
const ADDR = 0x48;												// Address of ADC
const i2cl = i2c.openSync(1);
i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);		// Write initial config
i2cl.i2cWriteSync(ADDR, lowthres_reg.length, lowthres_reg);		// Config low threshold register
i2cl.i2cWriteSync(ADDR, hithres_reg.length, hithres_reg);		// Config high threshold register
i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);			// Set pointer to conversion register

// For pressure calculation
var voltOut = 0;
const SUPPLY_VOLTAGE = 5.0;
var pressure = 0;

alertRdy.watch((err, value) => {
	if (err) throw err;

	// Get current value
	i2cl.i2cReadSync(ADDR, rbuf.length, rbuf);
	voltOut = ( rbuf.readInt16BE() / 65535 ) * SUPPLY_VOLTAGE;
	pressure = ( ( voltOut / SUPPLY_VOLTAGE ) - 0.5 ) / 0.2;

	console.log(pressure + " kPa");
	//console.log("Value: " + rbuf.readInt16BE());

	// Rewrite config register to have OS bit high
	// to trigger another read
	i2cl.i2cWriteSync(ADDR, ss_w_config.length, ss_w_config);
	i2cl.i2cWriteSync(ADDR, w_pointer.length, w_pointer);
});

// Stop process on interrupt CTRL-C
process.on('SIGINT', _ => {
	alertRdy.unexport();
});

