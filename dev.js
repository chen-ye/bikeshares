/* global L */
/* global d3 */
/* global firebase */
/* global $ */
/* global async */

// Initialize Leaflet + Mapzen
const mapzenKey = 'mapzen-i83ssVS';
// L.Mapzen.apiKey = 'mapzen-i83ssVS';
L.mapbox.accessToken = 'pk.eyJ1IjoiYmxhc3Rlcm50IiwiYSI6ImlwalZmdUkifQ.TJCtxxyNmRhvH-17afmGng';
//var map = L.Mapzen.map('map');

const map = L.mapbox.map('map').addLayer(L.mapbox.styleLayer("mapbox://styles/blasternt/cja1nhmg1akmg2rnvadioj22c"));

const networkId = "hubway";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAbu-hEkqh2PyaK1c078EUF-cuQ5VwBPnQ",
  authDomain: "bikeshares-37de2.firebaseapp.com",
  databaseURL: "https://bikeshares-37de2.firebaseio.com",
  projectId: "bikeshares-37de2",
  storageBucket: "bikeshares-37de2.appspot.com",
  messagingSenderId: "538370144257"
};
firebase.initializeApp(config);
const db = firebase.firestore();

const hubwayStationMap = {"3":"c039b478f4cd30b69758596ddcfd5cf5","4":"923c9498bf653bce81b9f5bf06f9c499","5":"0ebfbd58421465842f99d4e20c0188a8","6":"3e84baca09333cd2d2bce4f9234ea380","7":"94e2b48b7d791cb4edceb257f77d0553","8":"1c69a2302d6c2221cd6057a3f97fc548","9":"8cd611d2cc9bd7b7440c4723ce1d3eb6","10":"a5edb12b9f8d171ae1165a9a2ae1f644","11":"eb276799b6ebc22ee82f33566eb778b7","12":"2b46609efdfe9b6d300bad1e817e1efd","14":"d0ff6538806a4e5c46aa7e95f3fa47ce","15":"ea09e29b591e36435fb8b78918651709","16":"3c1cde4f3197b2599cc6140dc1ea4a80","17":"904b7113d7e610919a5336c1167674e2","19":"97a624904d68d950bc3c5016b4d4b28e","20":"9c85a06bb914c9897dda64fc412498c4","21":"c1ae903b130ca84ef5cb84caa16234db","22":"68dd25824f76cc3063f5120e674bfed9","23":"fe8d0aa13fd9937b7d09e4e26d5f0a8d","24":"5bf7e1226592f7ed603ce0690fa6a566","25":"a45aabe9b54b087818818dc78372bc43","26":"e56b6d877c8dfe81cafd06ca3a7eff71","27":"045fd5ea449046d51d40934e65b46bb5","29":"9153d52f686a63bde64a0bd74574e4e2","30":"96a2904d35d1297555d1d66c435ab29a","31":"a19e611442a8933b8f82774ce3966ace","32":"7d2aefcd5d8b2583ca9814b4fe51928b","33":"da1dc98bb8c74306eca078f7dac261a7","35":"fde40e6fbdcdcff8f513f82fbcadec3e","36":"a7216c0e6bf1375d25b6f104a714d44c","37":"fa4feed48aece06cb19271e25dd799f3","39":"05f50b281104f880804e0111662fecf8","40":"d27a92570184af7220c3130dace0e347","41":"43b6ca106693a73e04b23890e713ea24","42":"de54898148c9f009cd25a7a3ae4219b6","43":"2cce02b482530e0086ad9f529fe48c2b","44":"60ef31e770a3ea5dd7f350fc8877b5d3","46":"95fed99e3a4c8fd726a808cfe4bb2587","47":"4bf16679e6286a5cb72c1ae4526a3107","48":"feec0fa4c8ef432dd873e53115aaa7e9","49":"1714951f74f4b116e42fc312dffa3be9","51":"9f87f7c7336c31701521ddc50d39be0a","54":"0670eb9d5937bfea133bd73ff534c764","56":"ecd52be381f64f509517b6a0e4d7f6e7","57":"24a3f0ab2a83ab70ebe4bf0110cc890f","58":"56d2eb86c21c57692225ee5f13e31818","59":"2e4406867a3574184b0d6be7ede11d38","60":"9604a32e1c960659f85f1e22f44ce8a0","63":"f835af662d1afc1ee1ae8ccfbab70aee","65":"fbe59f14d93321aa504adc16f1081148","66":"338bbc5f3f1adf47da56ad7518bbb48e","67":"c91bc9b7e63c282da005f7eac27f8d96","68":"575e04966344a392bbbf9eccf09f029d","69":"f5cd79c9dd25baf7099ff87f1837686a","70":"6eeb219ec20094deafc039019160b33f","71":"6dbd6e946d3f4a22eda526eae1877257","72":"d8071846cc7cb01f669554ddebf02b65","73":"4f0217ba3cf7bea5a7e4d07e58ec259b","74":"559f6c10954fbe02c18f04cc0c2f7ddd","75":"295b9c9707dfc5ad38f5a26740a06b48","76":"39595521b8d76cff6372dc8355b1190c","77":"fc9d0d6dab0b0ccbb300289b4b2e92df","78":"669dfa375fcd4c6eead89ea6b89f6199","79":"0559164ae244ded879b0a74d8c122a77","80":"d14fddb02c64c81c4c9febd44968d294","81":"a35b80134814b7fd4592404b8ddb2a24","82":"5bcb4f7aa8bd4230cea068527529fd99","84":"34c6c5aae93dc743e4ef6dd633ee02bc","85":"6914c1962c64ca2a1c5f7bba047d9788","87":"e7bf3cb1dd05da389680f35f83927905","88":"0e48c04cc3047674d07fd003b5135dfe","89":"d0d13765d45b5bdf356acd9b859b7b99","90":"75568350ac15d1840f7f00b79913b6ee","91":"fce261dec8cf0d2593b65a7e8f726597","92":"db674ff3758d0911cdadd98f6f39f1a0","93":"9f6fae7b1b3a673377b452474ca2bcf1","94":"1e356b3d262d3819ace481af4e2d4135","95":"582f82ed392b7b5c072a7bbe40a40dfb","96":"8386693bdc273780efffd5d5eb9aed7c","97":"b01bba5bea3e1f63d6319d1f18a21271","98":"a0fa77069d080a45d5e9290af54e9f46","99":"600ca9bf59409d83f15862a1c0dfe4b0","100":"8826fb6a8e69e2fd45f22d8ee1c1a8de","102":"ad43939d620ef225d35eafdb9ef9a29d","103":"2b13bff9013c2beaf86e5f4544274345","104":"ad81792b682543ed97bf3188819c0b81","105":"94ce3435b4ade8bcc9585e0887771ef5","107":"d5d8f74a35cbfb15b544ff984c9f2307","108":"066efb58cb770f3d708a4f83a11fb374","109":"9e6a8c665def7b9475f618f73bf16e2e","110":"c3a13f2adb7762587acf15eec38bd91f","111":"f011b03ae269733cd81eb2058feeafe6","112":"3f002b9808de30c28132f3cde02667be","114":"6f7189e1db7479b6f143e990b6a2f79d","115":"272d2ed6d42ae8921f98b33d030519b6","116":"119f3ccd51ee15db7ff6f41bd497c601","117":"59599891ac2365b5fa23d5f61ecf17c4","118":"6cf4bfc8093794c40451d865b74e695e","119":"8414286d3232109891e1a2dfe396a59e","121":"0085d07859b67a2f60c8e7dad5f70f1a","124":"de412fd4ed57348bf9ec6bd7339b04f6","125":"f98ba2c9b1fb1563296760c08521dfcb","126":"f5577b56bb543db5cb15ae25621fe732","130":"709c9f1c1c7910bf3b94968d85630562","131":"24e99d91d84351d3e224e3d7ef2c7799","133":"68fc84a359655b54175ddc443e79003b","135":"997d209a53d13471372a1145c32d663a","136":"b03546e29d60dde109fa231ff93c88b5","137":"51ae4b12dfa3be5bf1cfd5ec621b2c3b","138":"af050e8bab271eeebf49b5407a09d415","139":"3831590999fc4a7f52d08952a6bd045d","140":"73935d28a37369a3e00400aacfb755f7","141":"d797b3a092f9f889b1cf181ec17e1ae2","142":"2b4e2a73580c8b3d22be6ea6480f0f30","143":"e05d253ccb22c56ee8624c467c8d81f6","145":"c199d7ad26651f605e7bb8778852a5e4","146":"0b0ef90ed68e023d65ed3b1c57eb6d36","149":"ded434853a62ec9703f2484cca685c20","150":"77b48a5112ce801c139722ae4d0edad7","151":"0f6de24ee3d6995945a685ecb9fe5771","152":"0d0f6b413915f118e0c8c7e0ea107ffa","157":"3eda44ce546b2d45a468cf7e2d0300a1","159":"a9af3ba18dec64bdfb9c2b644956243f","160":"3dc7433790fc03a6749498c3208a4e96","161":"be6410ffefa71e9a6282fa1fdef1bf72","162":"fa1b93d10ff350bd1e7469a1db231aa1","163":"f0683fe3086af95afeae07cc0357fd52","169":"f10d6a600af972c6b5d7953c49d5c654","170":"3d5ed4d9f089974d5d0f0fc19ad17d9c","171":"feba1b6e8c43b983bf48479cbacec840","173":"52f7c777f0850cb03ceb546289c74649","174":"66d0f515f619b404c689211df256024f","175":"b0f4189efee3fe8e880bfffcabfff93c","176":"352815b0fd48c554845e499609a51347","177":"2073f8fbb163ff4e693cfad00f0dd64f","178":"0e29fe31b281f3b6ca6f7c06c8eb7aa4","179":"943a5046e94d9462496182d9e38da371","180":"8482b3ad353c1e6e9e317296f41eb064","181":"1eeeb634d10232efadcbb8396fee8b88","182":"bf75e5d4343945db9675efcc60d1bf12","183":"246f58e0ae4db954e8dae72d11e19a81","184":"1f822fdb6173d31544d095e4fd981415","185":"bbdda846f9d9d1b155d4a3614ed7ecfe","186":"036ab7e3f20a35bce54f4497aa2470b9","189":"69c98e683921460eecdb85a49a0f7b77","190":"2601ac8e4decf87d75d824fa7e47b9a5","192":"4d51f6d4dc4b79326311d888ba73a86d","193":"171d66dfe7c34a2348eb9514d653fb1a","194":"7834292992b37578067b345232346bad","195":"7bd2d765ef465e66ae4ad4623daf4917","196":"ea3c9ae5995449b37ad7db1727bd6dee","197":"3ef6b015b6284b4731db6b9e02a3d1cb","200":"294242dbc29d86a80477f22608479bc8","201":"e1eb05d342c7993b9628a687211b04ea","202":"bb5087ad1912ee66a53a0245ce50eef4","203":"c2561905a4f6fad8c8bee1043bde9a6c","205":"aa2cadce93985cabcc8c1701a5c8be20","207":"3f57cfe0f525ea8ba9c2d07a1ce63a06","208":"9780cd14bba5099819fcd16c8bd8d897","209":"bbabf30a0df284668fd7594ab1218a56","210":"7944872d3021ca28cdaca8c32f9d0c7f","211":"66576a901b33431b167da0141c293dc5","212":"93542dcbf21f5411569adb92cd7cc199","213":"d9c7ef5dbda4ed944d1bf51fe540acb6","214":"63980598720f0bf1e318817f1be29afb","215":"8ece5437df6558cd259deb3b2af0e25e","217":"553ed0300d38108b4f21a6bafa3db70c","218":"2893854c4c64eb00b7cbac5381c3e6c5","219":"2743ef861ea179516fce8114a16965ec","221":"8d970bd1cdb480aeebc10da260449e02","222":"f0fc21e8403480413d2d2ac1d601d493","224":"c55f98cd397c770914c28a590e3ab90a","225":"1b7f50a75403e1f818b0b1dd81c09e9f","226":"e00981ae2721bdc7339d4ee00759f650","228":"eb7a7c91c78b8fb7982c1310d52be566"};

const initializeDb = () => {
  this.fetch(`https://api.citybik.es/v2/networks`).then((response) => {
    return response.json()
  }).then((json) => {
  	console.log("networks", json);
    json["networks"].forEach((network) => {
      const networkDoc = db.collection("networks").doc(network.id);
      networkDoc.set(network, { merge: true }).then(() => {
        // initalizeNetwork(network.id, networkDoc);
      });
    });
  });
}

const initializeNetwork = (networkId, networkDoc) => {
	this.fetch(`https://api.citybik.es/v2/networks/${networkId}`).then((response) => {
    return response.json()
  }).then((json) => {
  	console.log("stations", json);
    json["network"]["stations"].forEach((station) => {
      console.log(`Added ${station.id}`)
      networkDoc.collection("stations").doc(station.id).set(station, { merge: true });
    });
  })
}

const updateNetwork = (networkId, networkDoc, activityCallback) => {
  this.fetch(`https://api.citybik.es/v2/networks/${networkId}?fields=stations`).then((response) => {
    return response.json()
  }).then((json) => {
    json["network"]["stations"].forEach((station) => {
    	const stationDoc = networkDoc.collection("stations").doc(station.id);
      stationDoc.get().then((doc) => {
      	if(doc.exists) {
        	const oldStation = doc.data();
          if (oldStation.timestamp != station.timestamp) {
            let newRentals = station.extra.renting;
            let newReturns = station.extra.returning;

            if (!newRentals || !newReturns) {
              const deltaBikes = station.free_bikes - oldStation.free_bikes;
              newRentals = deltaBikes < 0 ? Math.abs(deltaBikes) : 0;
              newReturns = deltaBikes > 0 ? Math.abs(deltaBikes) : 0;
              station.extra.renting = newRentals;
              station.extra.returning = newReturns;
            }

            if (newRentals > 0 && activityCallback) {
              activityCallback(station, newRentals, newReturns);
            }

            stationDoc.set(station, { merge: true });
          }
        }
      });
    });
  })
}

// const progressBar = $("#trip-progress-bar");
// const progressText = document.getElementById("trip-progress-text");
// progressBar.progress();

// const updateProgress = (text, progress) => {
// 	progressText.textContent = text;
//   progressBar.progress({
//   	value: progress.addedTrips,
//     total: progress.totalTrips,
//   })
// }

const addFrequencies = (networkId, csv) => {
	return new Promise((resolve, reject) => {
  	const stationsRef = db.collection("networks").doc(networkId).collection("stations");
  	const routesRef = db.collection("networks").doc(networkId).collection("routes");
    const batch = db.batch();

    const frequenciesData = d3.csvParse(csv);
    frequenciesData.forEach((path, i) => {
      const startDbId = hubwayStationMap[path["start station id"]];
      const endDbId = hubwayStationMap[path["end station id"]];
      if(startDbId && endDbId) {
        const routeRef = routesRef.doc(`${startDbId} - ${endDbId}`);
        console.info(`Writing ${startDbId} - ${endDbId}: ${path["num trips"]}`)
        batch.set(routeRef, {
          startId: startDbId,
          endId: endDbId,
          frequency: parseInt(path["num trips"]),
      }, { merge: true });
      }
    })
    batch.commit().then(() => {
    	console.log('Batch frequency success.')
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

const handleFrequencyFile = (evt) => {
  const fileList = evt.target.files;
  for (let i = 0; i < fileList.length; i++) {
  	const csvFile = evt.target.files[i];
    if(csvFile && csvFile.type == "text/csv") {
      const csvReader = new FileReader();
      csvReader.addEventListener("load", (evt) => {
        const csvText = event.target.result;
        const csvMeta = addFrequencies(networkId, csvText);
      });
      csvReader.readAsText(csvFile);
    }
  }
}


const routerOptions = {
  costing: 'bicycle',
  costing_options: {
  	bicycle: {
    	bicycle_type: "city",
      cycling_speed: 16,
      use_hills: .4,
    }
  }
};

const routeTrip = function (startStation, endStation, networkId) {
	return new Promise((resolve) => {
  	const stationsRef = db.collection("networks").doc(networkId).collection("stations");
    const routeRef = stationsRef.doc(startStation.id).collection("routes").doc(endStation.id);
    routeRef.get().then((routeDoc) => {
      if (!routeDoc.exists) {
        const routeOptions = Object.assign({
          locations: [
            { lat: startStation.latitude, lon: startStation.longitude },
            { lat: endStation.latitude, lon: endStation.longitude },
          ],
        }, routerOptions);
        const route = this.fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(routeOptions)}&api_key=${mapzenKey}`).then((response) => {
          if(response.ok) {
          	console.log("fetched route");
            return response.json();
          }
          throw new Error(response.statusText);
        }).then((json) => {
          if(json.trip.status == 0) {
            routeRef.set(json.trip.legs[0]);
          }
          resolve();
        }).catch((error) => {
          console.error(error);
          resolve();
        });
      } else {
      	resolve();
      }
    });
  });
}

const routeTrips = (networkId) => {
	const networkRef = db.collection("networks").doc(networkId);
	const tripsRef = networkRef.collection("trips").limit(5000);
	const stationsRef = networkRef.collection("stations");
  
  tripsRef.get().then((querySnapshot) => {
  	async.eachLimit(querySnapshot.docs, 2, async function (doc) {
      return new Promise((resolve) => {
        const trip = doc.data();
        console.log(trip);
        stationsRef.where("extra.uid", "==", trip["start station id"]).limit(1).get().then((querySnapshot) => {
          if(querySnapshot.docs.length < 1) {
            console.error(`station id ${trip["start station id"]} not found`);
            resolve();
          } else {
            const startStation = querySnapshot.docs[0].data();
            stationsRef.where("extra.uid", "==", trip["end station id"]).limit(1).get().then((querySnapshot) => {
              if(querySnapshot.docs.length < 1) {
                console.error(`station id ${trip["end station id"]} not found`);
                resolve();
              } else {
                const endStation = querySnapshot.docs[0].data();
                routeTrip(startStation, endStation, networkId).then(() => {
                	resolve();
								});
              }
            })
          }
        })
      });
    })
  	
  })
}

const routeRoute = (stationsRef, routesRef, routeId, route) => {
  return new Promise((resolve, reject) => {
    console.log(routeId, route);
    
    if (!route.shape) {
      stationsRef.doc(route.startId).get().then((startRef) => {
        if(startRef.exists) {
          const startStation = startRef.data();
          stationsRef.doc(route.endId).get().then((endRef) => {
            if(endRef.exists) {
              const endStation = endRef.data();
              const routeOptions = Object.assign({
                locations: [
                  { lat: startStation.latitude, lon: startStation.longitude },
                  { lat: endStation.latitude, lon: endStation.longitude },
                ],
              }, routerOptions);
              const route = this.fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(routeOptions)}&api_key=${mapzenKey}`).then((response) => {
                if(response.ok) {
                	console.log("fetched route");
                  return response.json();
                } else {
                  if(response.status === 400) {
                    setTimeout(() => {
                      resolve();
                    }, 200);
                  } else {
                    throw new Error(response.statusText);
                  }
                }
              }).then((json) => {
                const routeResult = json.trip.legs[0];
                routeResult.hasShape = true;
                if(json && json.trip.status == 0) {
                  routesRef.doc(routeId).set(routeResult, {merge: true});
                }
                setTimeout(() => {
                  resolve();
                }, 200);
              }).catch((error) => {
                console.error(error);
                reject(error);
              });
            } else {
              console.error(`Station ${route.endId} does not exist`);
              resolve();
            }
          })
        } else {
          console.error(`Station ${route.startId} does not exist`);
          resolve();
        }
      })
    } else if (!route.hasShape) {
      console.log("begin entry update");
      routesRef.doc(routeId).set({hasShape: true}, {merge: true}).then(() => {
        console.log("updating entry");
        resolve();
      });
    } else {
      resolve();
    }
  });
}

const routeRoutes = (networkId) => {
  const networkRef = db.collection("networks").doc(networkId);
  const stationsRef = networkRef.collection("stations");
  const routesRef = networkRef.collection("routes");
  
  routesRef.orderBy("frequency", "desc").get().then((querySnapshot) => {
    async.eachLimit(querySnapshot.docs, 1, async (doc) => {
      return new Promise((resolve) => {
        const route = doc.data();
        routeRoute(stationsRef, routesRef, doc.id, route).then(() => {
          resolve();
        });
      });
    })
  })
}

const renderStations = (networkId) => {
	const networkDocRef = db.collection("networks").doc(networkId);
  networkDocRef.get().then((doc) => {
  	const network = doc.data();
    // map.setView([network.location.latitude, network.location.longitude], 12);
  });
  const stationsLayer = L.featureGroup().addTo(map);
  const stationsMarkers = new Map();
  const stationsRef = networkDocRef.collection("stations");
  stationsRef.onSnapshot((querySnapshot) => {
  	querySnapshot.docChanges.forEach((change) => {
    	const station = change.doc.data();
    	if (change.type === "added") {
        stationsMarkers.set(`${networkId}-${station.id}`, L.marker([station.latitude, station.longitude], {
          icon: L.divIcon({
            className: `station-icon ${networkId}-${station.id}`,
            html: '',
            iconSize: [8,8],
          })
        })
        .bindPopup(JSON.stringify(station))
        .addTo(stationsLayer));
      }
      if (change.type === "modified") {
      	const marker = stationsMarkers.get(`${networkId}-${station.id}`);
        marker.setOpacity(.5);
        //TODO
      }
    })
    map.fitBounds(stationsLayer.getBounds(), {
    	padding: [32, 32]
    });
  })
}

const renderRoutes = (networkId) => {
  const networkDocRef = db.collection("networks").doc(networkId);
  const routesRef = networkDocRef.collection("routes");
  
  const routesLayer = L.featureGroup().addTo(map);
  
  routesRef.orderBy("frequency", "desc").limit(1).get().then((querySnapshot) => {
    const maxFrequency = querySnapshot.docs[0].data().frequency;
    
    routesRef.onSnapshot((querySnapshot) => {
      querySnapshot.docChanges.forEach((change) => {
        const route = change.doc.data();
        if (change.type === "added") {
          console.log(`Path for ${change.doc.id} added`);
          if (route.shape) {
          	const routeCoordinates = polylineDecode(route.shape);
        		const routePolyline = L.polyline(routeCoordinates, {
        		  className: change.doc.id,
        		  color: "#177EA3", 
        		  opacity: route.frequency / maxFrequency * .5,
        		}).addTo(routesLayer);
          }
        }
      })
    })
  });
  
}

const polylineDecode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

// Render Hubway
initializeDb();
updateNetwork(networkId, db.collection("networks").doc(networkId), (station, newRentals, newReturns) => {
	//console.log(station, newRentals, newReturns);
});
renderStations(networkId);
renderRoutes(networkId);

document.getElementById("initialize-button").addEventListener("click", () => {
	initializeNetwork(networkId, db.collection("networks").doc(networkId));
}, false);

document.getElementById("pathfind-button").addEventListener("click", () => {
	routeRoutes(networkId);
}, false);

const frequencyFileElement = document.getElementById("frequency-file");
frequencyFileElement.addEventListener("change", handleFrequencyFile, false);