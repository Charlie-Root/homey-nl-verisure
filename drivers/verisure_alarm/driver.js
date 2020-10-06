'use strict';

const Homey = require('homey');
const api = require('../../lib/Api.js');

class AlarmDriver extends Homey.Driver {



    onPairListDevices( data, callback ) {

        
        api.getInstallations();
        

        if(Homey.ManagerSettings.get('giid') != "") {
            
            var devices = Array();
            var i = 0;
            devices[i] = {};
            devices[i]["name"] = Homey.ManagerSettings.get('alarm_name') + ' ' + Homey.ManagerSettings.get('alarm_houseno');
            devices[i]["data"] = {};
            devices[i]["data"]["id"] = Homey.ManagerSettings.get('giid');

            callback( null, devices);
        }
        

    }

}

module.exports = AlarmDriver;