'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');


const deviceMap = new Map();
require('es6-promise').polyfill();

class Smokedetector extends Homey.Driver {

	_initDevice() {
		this.log('_initDevice');
	}

	onPairListDevices(data, callback) {

		api.getClimateStatus();

		var d = Homey.ManagerSettings.get('climateStatus');
		if (d != null) {

			var devices = Array();
			var i = 0;
			var res = d["latestClimateSample"];

			res.forEach(function(entry) {


				if (entry["deviceType"][0] && entry["deviceType"][0] === "SMOKE1" || entry["deviceType"][0] === "SMOKE2" || entry["deviceType"][0] === "SMOKE3") {

					devices[i] = {};
					devices[i]["name"] = entry["deviceArea"][0];
					devices[i]["data"] = {};
					devices[i]["data"]["id"] = entry["deviceLabel"][0];
					i++;
				}
			});

			callback(null, devices);
		}
	}

}

module.exports = Smokedetector;