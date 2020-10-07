'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');

class Temperature extends Homey.Device {

	logger(data) {

		console.log(data);
	}

	// this method is called when the Device is inited
	onInit() {

		const POLL_INTERVAL = 30000; // 30 seconds

		// first run
		this.pollClimateStatus();

		this.interval = setInterval(this.pollClimateStatus.bind(this), POLL_INTERVAL);


	}
	onTempChange(value) {

		//this.log('onTempChange ');

		if (value) {
			this.setCapabilityValue('measure_temperature', value).catch(this.logger);
		}

	}



	// this method is called when the Device is added
	onAdded() {
		this.log('device added');
	}

	// this method is called when the Device is deleted
	onDeleted() {
		this.log('device deleted');
		clearInterval(this.interval);
	}

	pollClimateStatus() {

		if (Homey.ManagerSettings.get('username') != null) {

			var d = this.getName();

			api.getClimateStatus();


			var data = Homey.ManagerSettings.get('climateStatus');
			if (data) {
				var res = data["latestClimateSample"];
				var bla = this;
				if (res != null) {
					res.forEach(function(entry) {
						if (entry["deviceArea"][0] && entry["deviceArea"][0] === d) {
							bla.onTempChange(parseInt(entry["temperature"][0]));
						}
					});
				}
			}
		}
	}

}

module.exports = Temperature;
