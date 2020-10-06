'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');

class Smokedetector extends Homey.Device {

    logger ( data ) {
		
		console.log( data );
	}
	
    // this method is called when the Device is inited
    onInit() {

        const POLL_INTERVAL = 30000; // 30 seconds
      
        // first run
        this.pollClimateStatus();

       // //this.registerCapabilityListener('measure_temperature', this.onTempChange.bind(this));
        this._pollClimateInterval = setInterval(this.pollClimateStatus.bind(this), POLL_INTERVAL);
        

    }
    onTempChange(value) {
               
        if(value) {
            this.setCapabilityValue('measure_temperature', value);
        }

    }

    onHumidityChange(value) {
        
        
        
        if(value) {
            this.setCapabilityValue('measure_humidity', value);
        }
        

    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }
    pollClimateStatus() {

		if (Homey.ManagerSettings.get('username') != null) {      
            
           	
            var d = this.getName();
            
            api.getClimateStatus();

            
            var data = Homey.ManagerSettings.get('climateStatus');
            if(data) {

                var res = data["latestClimateSample"];
                var bla = this;
                
                if(res != null) {
                
                    res.forEach(function(entry) {
                        
                        
                        if(entry["deviceArea"][0] && entry["deviceArea"][0] === d) {
                    
                            
                            if(entry["temperature"][0]) {
                                bla.onTempChange(parseInt(entry["temperature"][0]));
                            }
                            if(entry["humidity"][0]) {
                                bla.onHumidityChange(parseInt(entry["humidity"][0]));
                            }
                        }
                    }); 
            
                }
            }
			return Promise.resolve();
			
		}
	}
	
}

module.exports = Smokedetector;
