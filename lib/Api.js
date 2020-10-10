'use strict';

const Homey = require('homey');
var request = require('request');
var xml2js = require('xml2js');
var SERVERS = ['e-api01.verisure.com', 'e-api02.verisure.com'];
var BASE_HOST = Homey.ManagerSettings.get('base_host');
var BASE_URL = 'https://' + BASE_HOST + '/xbn/2';
let date = require('date-and-time');

var timer = ms => new Promise( res => setTimeout(res, ms));

	
	
	
	const init = () => {
		
		
		Homey.ManagerSettings.set('select_lock', 0);
		Homey.ManagerSettings.set('token', null);
		
		if(BASE_HOST === null || BASE_HOST === "") {
			serverSelect();
			console.log('#23 base host empty');
		}else {
			console.log('#25 base host _NOT_ empty');
			authenticate();
		}
		
	}

	const serverSelect = () => {
		
		var lock = Homey.ManagerSettings.get('select_lock');

		if(lock > 0) {
			console.log('#39 Lock set');
			return false;
		} else {
			console.log('ServerSelect: Lock not set!');
			if(Homey.ManagerSettings.get('username')) {

				console.log("serverSelect; username found.");	
				Homey.ManagerSettings.set('select_lock', 1);

				var servers = SERVERS;

				var userid = Homey.ManagerSettings.get('username');
				var password = Homey.ManagerSettings.get('password');
				var cred = Buffer.from("CPE/" + userid + ":" + password).toString('base64');

				servers.forEach(function (server) {
						console.log(server);
						var opt = {
							port: 443,
							url: 'https://' + server + '/xbn/2' + '/cookie',
							method: 'POST',
							headers: {
								'Host' : server,
								'Content-Type': 'application/xml;charset=UTF-8',
								'Authorization' : 'Basic ' + cred
							},
							timeout: 1000
						};
				
					
					request(opt, function (err, res, body) {
						if (err) {
						console.log('Error :', err)
						return
						} else {
							console.log('#79 Got response no error');
						}

						var parser = new xml2js.Parser();
						var res = parser.parseString(body, function (err, result) {
						
						var status = result["response"]["status"];
						
						if(typeof status !== 'undefined') {
							console.log('for sure undefined');
							if(status[0]["errorMessage"] == "XBN Database is not activated") {
								
								return;
							}else if(status[0]["errorMessage"] == "Request limit has been reached") {

								console.log('We need to cool down');
								return;
							} else {
								console.log('setting server!');
								Homey.ManagerSettings.set('base_host', server);
								BASE_HOST = server;
								BASE_URL = 'https://' + BASE_HOST + '/xbn/2';
								Homey.ManagerSettings.set('select_lock', 0);
								return;
							}
						} else {
							console.log('#103 NOT undefined');
							Homey.ManagerSettings.set('base_host', server);
							BASE_HOST = server;
							BASE_URL = 'https://' + BASE_HOST + '/xbn/2';
							console.log('#105 *** Updated server to: ' + server);
							Homey.ManagerSettings.set('select_lock', 0);
							return;
						}
					});

						console.log(' Body :', body)
					
					});
		
				});	
					
				}     		
		}
		
	}


	const sendRequest = ( options ) =>{
		'use strict';
		console.log("sending request to " + BASE_URL);
		if(BASE_HOST === null) {
			serverSelect();
		}
		return new Promise( function ( resolve, reject ) {
			request( options, function requestCallback( error, response, body ) {
				//console.log ("prrrrr::: request executed");
				
				if (error) {
					reject('ERROR:' + response);
				} else if (!(/^2/.test('' + response.statusCode))) { // Status Codes other than 2xx
					console.log('** Fucking API sucks, need other server (resp: ' + response.statusCode +  ')');
					serverSelect();
					
					reject('error');
				} else if (options.json && !response.headers) {
					console.log('** Fucking API sucks, wrong headers!!');
					serverSelect();
					
					reject('error');
				} else if (options.json && response.headers['content-type'] !== 'application/json;charset=UTF-8') {
					reject('Expected JSON, but got html');
					
				} 
				//if(response.headers['content-type'] !== 'application/json;charset=UTF-8' || response.headers['content-type'] !== 'application/xml;charset=UTF-8') {
				//	console.log('Received wrong content-type!');
				//	serverSelect();
				//	reject ('Wrong content-type');
				//} 
				console.log('** API passed error check!!');

				
				// resolve / reject
				if ( error ) {
					console.log('ERR' + error);
					reject( error );
				} else {
					console.log('SendRequest Result ' + BASE_URL + ': ' + body);
					resolve( body );
				}
			});
		});
	}
	const setBaseHost = (server) =>{
		console.log('setBaseHost to ' + server);
		Homey.ManagerSettings.set('base_host', server);
	}
	const authenticate = () =>{
		
		console.log('authenticate, base host: ' + BASE_HOST);
		

		if (Homey.ManagerSettings.get('username') != null) {      
			
			console.log('Authenticating ......... ');

			var userid = Homey.ManagerSettings.get('username');
			var password = Homey.ManagerSettings.get('password');

			var cred = Buffer.from("CPE/" + userid + ":" + password).toString('base64');

			var opt = {
				port: 443,
				url: BASE_URL + '/cookie',
				method: 'POST',
				headers: {
					'Host' : BASE_HOST,
				  	'Content-Type': 'application/xml;charset=UTF-8',
				  	'Authorization' : 'Basic ' + cred
				}
			  };
			  
			  sendRequest(opt).then( parseApiResponse).then( setToken).then( getInstallations).catch(logger);
			  
		 }
		 else {
			 console.log('no user cred');
		 }
	}
	
	
	const parseApiResponse = (input) => {
				
		console.log("see if we can parse the request");		
		return new Promise( function ( resolve, reject ) {
			var parser = new xml2js.Parser();
			var res = parser.parseString(input, function (err, result) {
				console.log('PARSED: ' + result);
				resolve(result);
				
			});
		}).catch(function(err) {
			serverSelect();
		 });
	}
	const getOverview = () => {
		var lock = Homey.ManagerSettings.get('select_lock');

		if(lock > 0) {
			console.log('GetOverview: Lock set');
			return;
		} else {
			console.log('GetOverview: Lock not set');
			if(Homey.ManagerSettings.get('giid') != null) {
				var lock = Homey.ManagerSettings.set('select_lock', 1);

			console.log('GET OVERVIEW');
			var options = {
					port: 443,
					url: BASE_URL + '/installation/' + Homey.ManagerSettings.get('giid') + '/overview',
					method: 'GET',
					headers: {
						'Host': BASE_HOST,
						'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
					
					}
				};

			sendRequest(options).then(parseApiResponse).then(setDevices).catch(function (data) {
				logger("hmm error");
				logger(data);
				Homey.ManagerSettings.set('select_lock', 0);
			});
			}
		}
	}
	const setToken =(input) => {
		
		if( Homey.ManagerSettings.get('token') === null ) {
			if(input["response"] && input["response"]['createCookieResponse']) {
				var token = input["response"]['createCookieResponse'][0]['cookie'][0];
				Homey.ManagerSettings.set('token', token);
				console.log('TOKEN: ' + token);
			}
			else {
				console.log("LOGIN FAILED");
				console.log("DATA: " + input["response"]);
			}
		}
		else {
			console.log('TOKEN: ' + token);
		}
		
		
		
	}
	const getToken =( ) => {
		
		if( Homey.ManagerSettings.get('token') === null ) {
			console.log('no token found, new one requesting');
			authenticate();
			
		}
		else {
			
			return Homey.ManagerSettings.get('token');
		}
		
	}
	
	const getInstallation = (id) => {
		console.log("getInstallation");
		var options = {
			port: 443,
			url: BASE_URL + '/installation/'+ Homey.ManagerSettings.get('giid')  +'/',
			method: 'GET',
			headers: {
                'Host': BASE_HOST,
			    'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };

		  sendRequest(options).then(parseApiResponse).then(function ( input ) {
				console.log("GET INSTALLATION: " + input["response"]);
			
			}).catch(logger);

	}
	
	const getDoorWindow =() => {
		
		
		var data = Homey.ManagerSettings.get('apiData');
		if(data !== null) {
			var result = data["response"]["installationOverview"][0]["doorWindow"][0]["doorWindowDevice"];
			setDoorWindow(result);
			return result;
		}
	}
	
	const getClimateStatus =() => {
		
		
		var data = Homey.ManagerSettings.get('apiData');
		if(data !== null) {
			var result = data["response"]["installationOverview"][0]["climateValues"][0]
			setClimateStatus(result);
			return result;
		}
	}

	const setDoorWindow =(data) => { 
		//console.log('SetDoorWindow data: ' + data);	
		Homey.ManagerSettings.set('doorWindow', data);
	
	}
	const setClimateStatus =(data) => {
		//console.log('setClimateStatus data: ' + data);		
		Homey.ManagerSettings.set('climateStatus', data);
	}
	

	const getSmartLock = () => {
		console.log("getSmartLock");
		var options = {
			port: 443,
			url: BASE_URL + '/installation/'+ Homey.ManagerSettings.get('giid')  +'/doorlockstate/search/',
			method: 'GET',
			headers: {
				'Host': BASE_HOST,
				'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };

		  sendRequest(options).then(parseApiResponse).then(setSmartLock).catch(logger);
	}

	const setSmartLock = (data) => {
		//console.log("setSmartLock: " + data["response"]["doorLockStatus"]);
		Homey.ManagerSettings.set('SmartLock', data["response"]["doorLockStatus"]);
		
		
	}
	const setLockState = (deviceLabel, state) =>{
		console.log("setLockState");

			if (Homey.ManagerSettings.get('username') != null && Homey.ManagerSettings.get('keycode') != null) {      
			
				var keyCode = Homey.ManagerSettings.get('keycode');
				
				if(state === true) {
					var v = "lock";
				} else {
					var v = "unlock";
				}
				
				var opt = {
					port: 443,
					url: BASE_URL + '/installation/' + Homey.ManagerSettings.get('giid') + '/device/' + deviceLabel + '/' + v,
					method: 'PUT',
					headers: {
						'Host' : BASE_HOST,
						'Accept': 'application/json, text/javascript, */*; q=0.01',
						'Content-Type': 'application/json',
						'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
					},
					body: {
						code : Homey.ManagerSettings.get('keycode')
					},
					json: true			
				  };
				  
				  sendRequest(opt).catch(logger);
				  
			 }
			 else {
				 console.log('no user cred');
			 }
	}

    const getInstallations = () =>{
		console.log("getInstallations");

		var options = {
			port: 443,
			url: BASE_URL + '/installation/search?email=' + Homey.ManagerSettings.get('username'),
			method: 'GET',
			headers: {
                'Host': BASE_HOST,
			    'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
			  
			}
		  };
		  
		  sendRequest(options).then(parseApiResponse).then(setInstallationKey).catch(logger);
	
		}
    
    const setInstallationKey = (input) => {
	    
		Homey.ManagerSettings.set('giid', input["response"]['installation'][0]['giid'][0]);
		Homey.ManagerSettings.set('alarm_name', input["response"]['installation'][0]['street'][0]);
		Homey.ManagerSettings.set('alarm_houseno', input["response"]['installation'][0]['streetNo1'][0]);
		
	 	
    }		

    const getArmState = () => {
		
		
		var data = Homey.ManagerSettings.get('apiData');
		if(data != null) {

			if(data["response"]) {
				return data["response"]["installationOverview"][0]["armState"][0]["statusType"];
			}
		}
	}
	
	const setArmState = (newState) => {
		console.log('setArmState');

		if(newState === "partially_armed") {
            var v = "ARMED_HOME";
        }
        else if(newState === "armed") {
            var v = "ARMED_AWAY";
        }
        else if(newState === "disarmed") {
            var v = "DISARMED";
        }
        else {
            console.log('setArmState error');
        }


		if (Homey.ManagerSettings.get('username') != null) {      
			
			var keyCode = Homey.ManagerSettings.get('keycode');

			var opt = {
				port: 443,
				url: BASE_URL + '/installation/' + Homey.ManagerSettings.get('giid') + '/armstate/code',
				method: 'PUT',
				headers: {
					'Host' : BASE_HOST,
					'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/json',
				  	'Cookie': 'vid=' + Homey.ManagerSettings.get('token')
				},
				body: {
					code : Homey.ManagerSettings.get('keycode'),
					state : v
				},
				json: true			
			  };
			  
			  sendRequest(opt).then( parseApiResponse).then( setToken).catch(logger);
			  
		 }
		 else {
			 console.log('no user cred');
		 }
	}
	
	const setDevices = (data) => {

		var t1 = new Date();
		console.log('setting time!');
		Homey.ManagerSettings.set('apiData', data);
		Homey.ManagerSettings.set('apiUpdate', t1);
		
		console.log("**** updating device data");
		var lock = Homey.ManagerSettings.set('select_lock', 0);
		
	}
    const respond = (value) => {
	    return value;
    }
    
    const logger = ( data ) =>{
		
		console.log( data );
	}

	
module.exports = {
	getDoorWindow: getDoorWindow,
	setLockState: setLockState,
	getSmartLock: getSmartLock,
	getClimateStatus: getClimateStatus,
	getOverview: getOverview,
	getInstallations: getInstallations,
	getArmState: getArmState,
	setArmState: setArmState,
	getToken: getToken,
	init: init,
	authenticate: authenticate
};