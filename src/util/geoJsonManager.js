const fs = require('fs')

const coordinatesArray = [
	{ coordi: [126.92512160311284, 37.53048855990768], heading: 1.7 },
	{ coordi: [126.92360304723802, 37.52956814419788], heading: 1.9 },
	{ coordi: [126.92179651968831, 37.5314476361026], heading: 2.1 },
	{ coordi: [126.92193554791005, 37.531841398589975], heading: 2.1 },
	{ coordi: [126.92551017508136, 37.53078910219364], heading: 1.9 },
	{ coordi: [126.92512160311284, 37.53048855990768], heading: 1.7 },
]

export function makeGeoJson(coordiArray = coordinatesArray) {
	const geojson = {
		type: 'FeatureCollection',
		features: coordiArray.map((coord) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: coord.coordi,
			},
			properties: {
				heading: coord.heading,
			},
		})),
	}

	const geojsonString = JSON.stringify(geojson, null, 2)
	return geojsonString
}

export function makeGeoJsonFile(coordiArray = coordinatesArray) {
	const geojsonString = coordiArray

	fs.writeFile('coordinates.geojson', geojsonString, 'utf8', (err) => {
		if (err) {
			console.error('Error writing GeoJSON file:', err)
		} else {
			console.log('GeoJSON file saved successfully!')
		}
	})
}
