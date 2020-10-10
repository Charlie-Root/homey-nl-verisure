'use strict';

const Homey = require('homey');
const rp = require('request-promise');

const jar = rp.jar();
var session = require('client-sessions');
var request = require('request');
var xml2js = require('xml2js');

const api = require('./lib/Api.js');



class VerisureApp extends Homey.App {

	
	onInit() {

		

		this.log('[#46] VerisureApp is running...');
		api.init();
		setInterval(api.getOverview, 60000);

	}

	logger ( data ) {
		
		console.log( data );
	}
	
	

	async getUser() {
		
		this.log('[#130] Loading getUser()...');	
		
		if(Homey.ManagerSettings.get('username')) {
			
			this.log('username found. loading api');
			
			api.getToken();
			
			if(Homey.ManagerSettings.get('token') != null) {
				this.log('requested token');
				api.getInstallations();
				api.getOverview();
				
				if(Homey.ManagerSettings.get('alarm_name') != null) {
					return Homey.ManagerSettings.get('alarm_name') + ' ' + Homey.ManagerSettings.get('alarm_houseno');
				}
				else {
					return "NOTOK";
				}
			}
			
		} else {
			
			return "NOTOK";
		}


		return false;
	}

	
	async setUser(username, password) {
		

		Homey.ManagerSettings.set('username', username);
		Homey.ManagerSettings.set('password', password);


		return this.getUser();

	}

	async setUserKeycode(keycode) {
		console.log("Set user keycode:" + keycode );
		Homey.ManagerSettings.set('keycode', keycode);
	}

	async unsetUser() {
		Homey.ManagerSettings.unset('username');
		Homey.ManagerSettings.unset('password');
	}
	
}

module.exports = VerisureApp;

