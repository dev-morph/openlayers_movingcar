<template>
	<div class="map__wrapper">
		<p>{{ animating ? 'MOVING...!' : 'STOPPED!' }}</p>
		<p :style="{ color: 'rgba(160, 51, 255, 1)', fontWeight: 'bolder' }">
			CURRENT POSITION
		</p>
		<p>{{ carPosition.pos }}</p>
		<button @click="clickHandler">
			{{ animating ? 'Stop Car' : 'Move Car' }}
		</button>
		<div class="map" ref="map"></div>
	</div>
</template>

<script>
import { ref, reactive } from 'vue'
import OlLayerTile from 'ol/layer/Tile.js'
import OlView from 'ol/View.js'
import OlMap from 'ol/Map.js'
import { defaults } from 'ol/control.js'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj.js'
// for vectorlayer
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import {
	Circle,
	Fill,
	Icon,
	Stroke,
	Style,
	Circle as CircleStyle,
} from 'ol/style.js'
// import Logo from '@/assets/logo.png'
// import CarIcon from '@/assets/car_top.svg'
import PoliceCar from '@/assets/policecar.png'
import { convertCoordinatesToGeometry } from '@/util/geoUtil'
// to move car
import Polyline from 'ol/format/Polyline.js'
import { LineString } from 'ol/geom'
import { getVectorContext } from 'ol/render.js'
import { onMounted } from 'vue'

export default {
	name: 'MainMap',
	setup() {
		const map = ref(null)
		const mapCenter = fromLonLat([126.92441579076426, 37.529266034555306])
		const animating = ref(false)
		const carPosition = reactive({
			pos: [126.92512160311284, 37.53048855990768],
		})

		function clickHandler() {
			if (animating.value) {
				stopAnimation()
			} else {
				startAnimation()
			}
		}

		// ####### Moving Marker with POLY LINE
		const coordinatesArray = [
			[126.92512160311284, 37.53048855990768],
			[126.92360304723802, 37.52956814419788],
			[126.92179651968831, 37.5314476361026],
			[126.92193554791005, 37.531841398589975],
			[126.92551017508136, 37.53078910219364],
			[126.92512160311284, 37.53048855990768],
		]

		const polylineString = convertCoordinatesToGeometry(coordinatesArray)

		const route = new Polyline({ factor: 1e6 }).readGeometry(polylineString, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857',
		})

		const routeFeature = new Feature({
			type: 'route',
			geometry: route,
		})
		// const startMarker = new Feature({
		// 	type: 'icon',
		// 	geometry: new Point(route.getFirstCoordinate()),
		// })
		const startPosition = new Point(route.getFirstCoordinate())

		const movingPosition = startPosition.clone()
		const movingMarker = new Feature({
			type: 'car',
			geometry: movingPosition,
		})

		const styleMap = {
			route: new Style({
				stroke: new Stroke({
					width: 1,
					color: [160, 51, 255, 1],
				}),
			}),
			icon: new Style({
				image: new CircleStyle({
					radius: 1,
					fill: new Fill({ color: [160, 51, 255, 1] }),
					stroke: new Stroke({
						color: [160, 51, 255, 1],
						width: 0.1,
					}),
				}),
			}),
			car: new Style({
				image: new Icon({
					src: PoliceCar,
					offset: [0, 0],
					scale: 0.08,
					rotation: -0.2 * Math.PI,
				}),
			}),
		}

		const vectorSource = new VectorSource({
			features: [routeFeature, movingMarker],
		})

		// moving animation
		const speed = Number(300)
		let lastTime
		let distance = 0
		function moveFeature(event) {
			const time = event.frameState.time
			const elapsedTime = time - lastTime
			const leftDistance = (distance + (speed * elapsedTime) / 1e6) % 2
			console.log('distance!', distance, '---> ', leftDistance)
			if (
				(distance <= 1 && leftDistance >= 1) ||
				(distance >= 1 && leftDistance <= 1)
			) {
				const currentRotation = styleMap['car'].getImage().getRotation()
				const flipRotation =
					currentRotation < 0
						? (currentRotation / Math.PI + 1) * Math.PI
						: (currentRotation / Math.PI - 1) * Math.PI
				console.log('arrived!!')

				endAnimation()
				animating.value = false
				// styleMap['car'].getImage().setRotation(flipRotation)
				return
			}

			distance = leftDistance
			lastTime = time

			const currentCoordinate = route.getCoordinateAt(
				distance > 1 ? 2 - distance : distance
			)
			carPosition.pos = toLonLat(currentCoordinate)
			movingPosition.setCoordinates(currentCoordinate)
			const vectorContext = getVectorContext(event)
			vectorContext.setStyle(styleMap.car)
			vectorContext.drawGeometry(movingPosition)
			// tell OpenLayers to continue the postrender animation
			olMap.render()
		}

		function startAnimation() {
			animating.value = true
			lastTime = Date.now()
			vectorLayer.on('postrender', moveFeature)
			// hide geoMarker and trigger map render through change event
			movingMarker.setGeometry(null)
		}

		function stopAnimation() {
			animating.value = false
			lastTime = Date.now()
			movingMarker.setGeometry(movingPosition)
			vectorLayer.un('postrender', moveFeature)
		}
		function endAnimation() {
			animating.value = false
			lastTime = Date.now()
			// movingMarker.setGeometry(null)
			movingMarker.setGeometry(movingPosition)
			vectorLayer.un('postrender', moveFeature)
			initMovingAnimation()
		}
		function initMovingAnimation() {
			distance = 0
			lastTime = null
			distance = 0
		}

		//Vector layer 선언
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			// 스타일 매핑
			style: (feature) => styleMap[feature.get('type')],
		})

		let olMap

		onMounted(() => {
			olMap = new OlMap({
				target: map.value,
				controls: defaults({
					attribution: false,
					zoom: false,
					rotate: false,
				}),
				layers: [new OlLayerTile({ source: new OSM() }), vectorLayer],
				view: new OlView({
					center: mapCenter, // 여의도 좌표, 차량 출발 좌표 --> 126.92513362770029, 37.53047254039565
					zoom: 17,
				}),
			})
			olMap.on('click', (event) => {
				const currentPosition = toLonLat(event.coordinate)
				alert(currentPosition)
			})
		})

		return {
			olMap,
			map,
			vectorSource,
			vectorLayer,
			mapCenter,
			carPosition,
			animating,
			styleMap,
			clickHandler,
		}
	},

	mounted() {},
}
</script>

<style scoped>
.map__wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}
button {
	width: 5rem;
	height: 2rem;
}
.map {
	width: 100vw;
	height: 100%;
}
.police_car {
	width: 100px;
	height: 100px;
	background-color: red;
}
</style>
