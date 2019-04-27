'use strict';

const Homey = require('homey');
var request = require('request');
var xml2js = require('xml2js');
const Verisure = require('../../lib/Api.js');

class Alarm extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        
        const POLL_INTERVAL = 30000; // 30 seconds

        
        let api = new Verisure();
        api.getInstallations();
       
        this.registerCapabilityListener('homealarm_state', this.onCapabilityOnoff.bind(this))

        // set poll interval
        this._pollAlarmInterval = setInterval(this.pollAlarmStatus.bind(this), POLL_INTERVAL);

        
    }

    logger ( data ) {
		
		console.log( data );
	}

    
    
    onAlarmUpdate(state) {
        
        
        if(state == "ARMED_HOME") {
            var v = "partially_armed";
        }
        else if(state == "ARMED_AWAY") {
            var v = "armed";
        }
        else if(state == "DISARMED") {
            var v = "disarmed";
        }
        else {
            console.log(' unknown status: ' + state);
        }
        this.log('new slarm state: ' + v);
        this.setCapabilityValue('homealarm_state', v);
         
        Promise.resolve();
        //callback(null, state);

    }
    pollAlarmStatus() {

        let api = new Verisure();
        var s = api.getArmState();
        this.onAlarmUpdate(s);
        Promise.resolve();
    }
    // this method is called when the Device is added
    onAdded() {
        this.log('device added');

        // init first time
        this.pollAlarmStatus();
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        

        if(Homey.ManagerSettings.get('keycode')) {
            let api = new Verisure();
            api.setArmState(value);
            console.log('Set alarm to : ' + value);
            callback(null, value);
        }
        else {
            callback("error", false);
        }

    }

}

module.exports = Alarm;
