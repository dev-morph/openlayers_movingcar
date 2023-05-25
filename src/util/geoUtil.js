import { LineString } from 'ol/geom'
import Feature from 'ol/Feature.js'
import Polyline from 'ol/format/Polyline.js'
import Point from 'ol/geom/Point.js'
import {
	Circle,
	Fill,
	Icon,
	Stroke,
	Style,
	Circle as CircleStyle,
} from 'ol/style.js'
import PoliceCar from '@/assets/policecar.png'

export function convertCoordinatesToGeometry(coordinates) {
	// 위경도 좌표를 lineString 객체로 변환하고,
	const geometry = new LineString(coordinates)
	// lineString객체를 geometryString으로 변경한다.
	const polylineString = new Polyline({ factor: 1e6 }).writeGeometry(geometry)
	return polylineString
}

// 입력받은 좌표에 자동차 생성하는 함수.
// return 된 iconFeature를 원하는 vectorLayer에 넣어주면 된다.
/**
 * 
 * @param {*} carPosition 
 * @returns iconFeature, return 값을 하는 vectorLayer에 넣어주면 된다. 
 * e.g. 
 * vectorSource = new VectorSource({
		features: [iconFeature],
	})
 */
export function createCarIcon(carPosition) {
	const iconFeature = new Feature({
		geometry: new Point(carPosition),
	})
	const iconStyle = new Style({
		image: new Icon({
			// 어차피 anchor는 default 가 [0.5, 0.5]
			// anchor: [0.5, 0.5],
			src: PoliceCar,
			offset: [0, 0],
			//size 옵션을 사용하면, 이미지에서 해당 사이즈 만큼만 crop 하는 것 처럼 되므로, size를 사용하자.
			scale: 0.08,
		}),
	})

	const pointStyle = new Style({
		image: new Circle({
			anchor: [0.5, 0.5],
			radius: 7,
			fill: new Fill({
				color: 'black',
			}),
			stroke: new Stroke({
				color: 'black',
				width: 2,
			}),
		}),
	})
	iconFeature.setStyle([iconStyle, pointStyle])

	return iconFeature
}

export function getDegreesFromCoordinates(lon1, lat1, lon2, lat2) {
	// Convert degrees to radians
	const lat1Rad = (lat1 * Math.PI) / 180
	const lon1Rad = (lon1 * Math.PI) / 180
	const lat2Rad = (lat2 * Math.PI) / 180
	const lon2Rad = (lon2 * Math.PI) / 180

	// Calculate the angle using the spherical law of cosines formula
	const deltaLon = lon2Rad - lon1Rad
	const y = Math.sin(deltaLon) * Math.cos(lat2Rad)
	const x =
		Math.cos(lat1Rad) * Math.sin(lat2Rad) -
		Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon)
	let angleRad = Math.atan2(y, x)
	let angleDeg = (angleRad * 180) / Math.PI

	// Ensure the angle is positive
	if (angleDeg < 0) {
		angleDeg += 360
	}

	return angleDeg
}

export function radianToDegree(radian) {
	if (typeof radian !== 'number') {
		throw new Error('radian should be number Type!')
	}
	return (radian * 180) / Math.PI
}

export function degreesToRadian(degrees) {
	if (typeof degrees !== 'number') {
		throw new Error('degrees should be number Type!')
	}
	return (degrees * Math.PI) / 180
}
