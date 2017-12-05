

// const handleFiles = (evt) => {
// 	const fileAddPromises = [];
//   const fileList = evt.target.files;
//   const progress = {
//   	totalTrips: 0,
//     addedTrips: 0,
//   };
//   for (let i = 0; i < fileList.length; i++) {
//   	csvFile = evt.target.files[i];
//     if(csvFile && csvFile.type == "text/csv") {
//       const csvReader = new FileReader();
//       csvReader.addEventListener("load", (evt) => {
//         const csvText = event.target.result;
//         const csvMeta = addTrips(networkId, csvText, progress);
//         progress.totalTrips += csvMeta.totalTrips;
//         fileAddPromises.push(csvMeta.promise);
//   			updateProgress(`Processing ${progress.totalTrips} Trips`, progress);
//       });
//       csvReader.readAsText(csvFile);
//     }
//   }
  
//   Promise.all(fileAddPromises).then(() => {
//   	//progressElement.textContent = "Database Add Complete";
//   });
// }

// const addTrips = (networkId, csv, progress) => {
// 	tripsAddPromises = [];
//   tripsData = d3.csvParse(csv);
//   tripsData.forEach((trip) => {
//   	const docRef = db.collection("networks").doc(networkId).collection("trips")
//     		.doc(Date.parse(trip.starttime).toString());
//   	tripsAddPromises.push(
//     	docRef.set(trip).then(() => {
//         	progress.addedTrips += 1;
//           updateProgress(`${progress.addedTrips}/${progress.totalTrips} Trips`, progress);
//         })
//     );
//   });
//   return {
//     promise: Promise.all(tripsAddPromises),
//     totalTrips: tripsData.length,
//   }
// }

// const routeTripById = (startId, endId, networkId) => {
// 	const stationsRef = db.collection("networks").doc(networkId).collection("stations");
//   const startStationRef = stationsRef.doc(startId);
//   startStationRef.get().then((startDoc) => {
//     const startStation = startDoc.data();
//     const routeRef = startStationRef.collection("routes").doc(endId);
//     routeRef.get().then((routeDoc) => {
//     	if (!routeDoc.exists) {
//       	stationsRef.doc(endId).get().then((endDoc) => {
//           const endStation = endDoc.data();
//           const routeOptions = Object.assign({
//             locations: [
//               { lat: startStation.latitude, lon: startStation.longitude },
//               { lat: endStation.latitude, lon: endStation.longitude },
//             ],
//           }, routerOptions);
//           this.fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(routeOptions)}&api_key=${mapzenKey}`).then((response) => {
//           console.log(response.ok);
//           if(response.ok) {
//             return response.json();
//           }
//           throw new Error('Network response was not ok.');
//           }).then((json) => {
//           	if(json.trip.status == 0) {
// 							routeRef.set(json.trip.legs[0]);
//             }
//           }).catch((error) => {
//             console.log(error);
//           });
//         });
//       }
//     })
    
//   });
// }


        // stationsRef.doc(station.id).collection("routes").orderBy("frequency").limit(2).get().then((querySnapshot) => {
        // 	querySnapshot.forEach((doc) => {
        //   	console.log("check");
        //   	console.log(doc.data());
        //   })
        // });
        
        //stationsRef.doc(station.id).collection("routes").onSnapshot((querySnapshot) => {
        //	querySnapshot.docChanges.forEach((change) => {
        //  	const route = change.doc.data();
        //    console.log("check");
        //    if (change.type === "added") {
        //    	if (route.shape) {
        //      	const routeCoordinates = polylineDecode(route.shape);
        //    		const routePolyline = L.polyline(routeCoordinates, {color: "#177EA3", opacity: .2}).addTo(routesLayer);
        //      }
        //    }
        //  })
        //});
        
        

// const inputElement = document.getElementById("input");
// inputElement.addEventListener("change", handleFiles, false);