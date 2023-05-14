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
