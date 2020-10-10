'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');


const deviceMap = new Map();
require('es6-promise').polyfill();

class SmartLock extends Homey.Driver {

    _initDevice() {
        this.log('_initDevice');
		
    }

    onPairListDevices( data, callback ) {
        console.log("Discover smartlock");
        
        api.getSmartLock();
      
        var d = Homey.ManagerSettings.get('SmartLock');
		
        if(d != null) {
            var devices = Array();
            var i = 0;
			d.forEach(function(entry) {
                
                
                
                devices[i] = {};
                devices[i]["name"] = entry["area"][0];
                devices[i]["data"] = {};
                devices[i]["data"]["id"] = entry["zone"][0];
                devices[i]["data"]["deviceLabel"] = entry["deviceLabel"][0];
                
                i++;
                
            }); 
            
            callback( null, devices); 
            
        }
        
    }

}

module.exports = SmartLock;