'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');

class DoorWindow extends Homey.Device {

    logger ( data ) {
		
		console.log( data );
	}
	
    // this method is called when the Device is inited
    onInit() {
       
        const POLL_INTERVAL = 5000; // 5 seconds 

         // register a capability listener
        //this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

        this.interval = setInterval(this.pollSensorStatus.bind(this), POLL_INTERVAL);
        

    }
    onSensorChange(hasContact) {
        
        if(hasContact != null) {
           this.setCapabilityValue('alarm_contact', hasContact).catch(this.logger);
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

    pollSensorStatus() {
		if (Homey.ManagerSettings.get('username') != null) {      
            
           
            var d = this.getName();
            
            var data = api.getDoorWindow();
            
            var bla = this;
            
			if(data != null) {
                data.forEach(function(entry) {
                
                
                    if(entry["area"][0] && entry["area"][0] === d) {
                        //bla.log(" match: " + entry["area"][0] + " " + entry["state"][0]);
                       
                        bla.onSensorChange(entry["state"][0] === "OPEN");
                        
                    }
                }); 
            }
           
		}
	}
	
}

module.exports = DoorWindow;
