'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');


const deviceMap = new Map();
require('es6-promise').polyfill();

class DoorWindow extends Homey.Driver {

	_initDevice() {
		this.log('_initDevice');



	}

	onPairListDevices(data, callback) {

		api.getDoorWindow();


		var d = Homey.ManagerSettings.get('doorWindow');

		if (d != null) {
			var devices = Array();
			var i = 0;
			d.forEach(function(entry) {


				console.log('found ' + entry["area"][0]);
				devices[i] = {};
				devices[i]["name"] = entry["area"][0];
				devices[i]["data"] = {};
				devices[i]["data"]["id"] = entry["deviceLabel"][0];
				i++;

			});

			callback(null, devices);

		}
	}

}

module.exports = DoorWindow;