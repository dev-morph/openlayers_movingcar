import OlLayerTile from 'ol/layer/Tile.js'
import OlView from 'ol/View.js'
import OlMap from 'ol/Map.js'
import Overlay from 'ol/Overlay.js'
import OSM from 'ol/source/OSM'
import { defaults } from 'ol/control.js'
import Feature from 'ol/Feature'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'

export class MapMaster {
	//this class must be singleton
	static olMap = null

	//생성자
	constructor(target, center) {
		if (MapMaster.olMap) {
			return this
		}
		MapMaster.olMap = new OlMap({
			target: target,

			// override default controls to disasppear
			controls: defaults({
				attribution: false,
				zoom: false,
				rotate: false,
			}),

			// add layers to Map Object
			layers: [new OlLayerTile({ source: new OSM() })],

			// add View Object that determines how and where to show in Map Object
			// e.g. center, zoom-level, projection
			view: new OlView({
				center: center, // 여의도 좌표
				zoom: 16,
			}),
		})
	}

	//olMap 객체 리턴
	getOlMap() {
		if (MapMaster.olMap) return MapMaster.olMap
		throw new Error('Create olMap First')
	}

	//olMap 객체에 layer 추가
	addLayer(layer) {
		MapMaster.olMap.addLayer(layer)
	}

	//olMap 객체에 overlay 추가
	addOverlay(overlay) {
		MapMaster.olMap.addOverlay(overlay)
	}

	//Overlay 생성
	createOverlay(element) {
		console.log('let see element', element)
		const popupLayer = new Overlay({
			element: element,
			stopEvent: false,
			autoPan: true,
			autoPanAnimation: {
				duration: 250,
			},
		})

		return popupLayer
	}

	getFeaturesByEvent(event) {
		const features = MapMaster.olMap.forEachFeatureAtPixel(
			event.pixel,
			function (feature, layer) {
				return feature
			}
		)
		return features
	}
}

/**
 *
 * @param {*} obj should contain 'type', 'geometry' keys
 *
 * FYI, you can put custom properties, e.g. id, color, etc
 * @returns Feature Object
 */
export function createCustomFeature(obj) {
	return new Feature(obj)
}

/**
 *
 * @param {*} features should be array type.
 * @returns VectorSource Object
 */
export function createVectorSource(features) {
	if (!Array.isArray(features)) {
		console.log('features should be Array!')
	}
	return new VectorSource({
		features: features,
	})
}

/**
 *
 * @param {*} source should be VectorSource Object
 * @param {*} style should be function
 * @returns VectorLayer Object
 */
export function createVectorLayer(source, style) {
	return new VectorLayer({
		source: source,
		style: style,
	})
}
