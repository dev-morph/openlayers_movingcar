<template>
	<div class="map__wrapper">
		<div class="btn__wrapper">
			<button @click="clickHandler">
				{{ animating ? 'Stop Car' : 'Move Car' }}
			</button>
			<button @click="gobackHandler">뒤로 가기</button>
		</div>

		<p>CURRENT POSITION: {{ mousePosition }}</p>

		<div class="map" ref="map"></div>
	</div>
</template>

<script>
import OlLayerTile from 'ol/layer/Tile.js'
import OlView from 'ol/View.js'
import OlMap from 'ol/Map.js'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import { fromLonLat, toLonLat, transform } from 'ol/proj.js'
import { defaults } from 'ol/control.js'
import { ref, onMounted } from 'vue'
import { Style, Circle as CircleStyle, Stroke, Fill } from 'ol/style'
import GeoJSON from 'ol/format/GeoJSON.js'
import Feature from 'ol/Feature'
import { LineString, Point, MultiLineString } from 'ol/geom'
import { getVectorContext } from 'ol/render'
import { esaseIn } from 'ol/easing'

export default {
	name: 'TestPage',

	setup() {
		const testGeoJson = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [126.92512160311284, 37.53048855990768],
					},
					properties: {
						heading: 1.3,

						radius: 50,
					},
				},

				{
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [126.92360304723802, 37.52956814419788],
					},
					properties: {
						heading: 1.5,
						radius: 60,
					},
				},
				{
					type: 'Feature',

					geometry: {
						type: 'Point',

						coordinates: [126.92179651968831, 37.5314476361026],
					},

					properties: {
						heading: 1.7,
						radius: 50,
					},
				},

				{
					type: 'Feature',

					geometry: {
						type: 'Point',

						coordinates: [126.92193554791005, 37.531841398589975],
					},

					properties: {
						heading: 1.8,
						radius: 70,
					},
				},

				{
					type: 'Feature',

					geometry: {
						type: 'Point',

						coordinates: [126.92551017508136, 37.53078910219364],
					},

					properties: {
						heading: 1.9,
						radius: 80,
					},
				},

				{
					type: 'Feature',

					geometry: {
						type: 'Point',

						coordinates: [126.92512160311284, 37.53048855990768],
					},

					properties: {
						heading: 2.1,
						radius: 90,
					},
				},
			],
		}

		const animating = ref(false)

		const map = ref(null)

		const mousePosition = ref([])

		const center = fromLonLat([126.9251405697578, 37.53033241217628])

		const styles = {
			Point: new Style({
				image: new CircleStyle({
					radius: 10,

					fill: new Fill({ color: [160, 51, 255, 1] }),

					stroke: new Stroke({
						color: [160, 51, 255, 1],

						width: 0.1,
					}),
				}),
			}),

			Car: new Style({
				image: new CircleStyle({
					radius: 10,
					fill: new Fill({ color: [255, 0, 0, 1] }),
					stroke: new Stroke({
						color: [160, 51, 255, 1],
						width: 5,
					}),
				}),
			}),
			NewCar: new Style({
				image: new CircleStyle({
					radius: 10,
					fill: new Fill({ color: [100, 0, 0, 1] }),
					stroke: new Stroke({
						color: [160, 51, 255, 1],
						width: 5,
					}),
				}),
			}),

			MultiLineString: new Style({
				stroke: new Stroke({
					width: 3,

					color: [160, 51, 255, 1],
				}),
			}),

			line: new Style({
				stroke: new Stroke({
					width: 3,

					color: [160, 51, 255, 1],
				}),
			}),
		}

		const features = testGeoJson.features.map((geoJsonFeature) => {
			const coordinates = geoJsonFeature.geometry.coordinates

			const geometry = new Point(fromLonLat(coordinates))

			const feature = new Feature({
				geometry: geometry,

				properties: geoJsonFeature.properties,
			})

			return feature
		})

		function styleHandler(feature) {
			const customType = feature.values_.type

			const targetType = customType
				? customType
				: feature.getGeometry().getType()

			return styles[targetType]
		}

		function clickHandler() {
			if (!animating.value) {
				startAnimation()
			} else {
				stopAnimation()
			}
		}

		const duration = 1000
		let start
		let currentIndex = 0
		let distance = 0 // Animation Method

		function moveFeature(event) {
			const frameState = event.frameState
			const elapsedTime = frameState.time - start
			const from = features[currentIndex].getGeometry().getCoordinates()
			const to =
				currentIndex === features.length - 1
					? features[0].getGeometry().getCoordinates()
					: features[currentIndex + 1].getGeometry().getCoordinates()

			// duration에 도달 했다면, 이는 도착 위치에 도달 했다는 뜻.
			// currentIndex를 하나 늘리고, 다시 반복하면 된다.
			// 단, currentIndex가 features.length에 도달하기 전까지 postrender이벤트를 멈추면 안되고,
			// 도달 했을 때에만 postrender이벤트를 unlisten 하기 위해, stopAnimation()을 호출 한다.
			if (elapsedTime >= duration) {
				if (++currentIndex >= features.length) {
					stopAnimation()
					carPosition.setCoordinates(from)
					return
				}
				console.log('curIdx', currentIndex, features.length)
				start = Date.now()
				vectorLayer.on('postrender', moveFeature)
			}

			const vectorContext = getVectorContext(event)

			// Important
			// 정해진 시간(duration)에서 실제 지나간 시간 비율로 현재 좌표를 구해 애니메이션 효과를 넣어준다.
			const elapsedRatio = elapsedTime / duration
			const currentPosition = new Point([
				from[0] + (to[0] - from[0]) * elapsedRatio,
				from[1] + (to[1] - from[1]) * elapsedRatio,
			])

			console.log('currentPosition', currentPosition.getCoordinates())
			console.log('currentIndex', currentIndex)

			// 구한 현재 좌표와 스타일을 적용시킨다.
			carPosition.setCoordinates(currentPosition.getCoordinates())
			// 여기서 heading 값을 이용하여
			// styleMap['car'].getImage().setRotation(flipRotation)
			// 형식으로 rotation 값을 변경 해 줄 수 있다.
			vectorContext.setStyle(styles.Car)
			vectorContext.drawGeometry(carPosition)
			olMap.render()
		}

		function gobackHandler() {
			console.log('currentIndex', currentIndex)
			// if (currentIndex === 0) {
			// 	startAnimation()
			// 	stopAnimation()
			// } else {
			// 	currentIndex--
			// 	console.log(currentIndex)
			// }
		}
		function startAnimation() {
			animating.value = true
			start = Date.now()
			vectorLayer.on('postrender', moveFeature)
			carFeature.setGeometry(null)
		}

		function stopAnimation() {
			animating.value = false
			start = Date.now()
			vectorLayer.un('postrender', moveFeature)
			//초기화
			carFeature.setGeometry(carPosition)
			currentIndex = 0
			distance = 0
		}

		const multiLine = new MultiLineString([
			features.map((feature) => feature.getGeometry().getCoordinates()),
		])

		const lineFeature = new Feature(multiLine)
		const startPosition = new Point(multiLine.getCoordinates()[0][0])
		const carPosition = startPosition.clone()
		const carFeature = new Feature({
			type: 'Car',
			geometry: carPosition,
		})

		const movingSource = new VectorSource({
			// features: [...features, carFeature, lineFeature],
			features: [lineFeature, carFeature],
		}) //Vector layer 선언

		const vectorLayer = new VectorLayer({
			source: movingSource,

			style: styleHandler,
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
					center: center, // 여의도 좌표

					zoom: 17,
				}),
			})

			olMap.on('click', (event) => {
				const currentPosition = toLonLat(event.coordinate)

				mousePosition.value = currentPosition
			})
		})

		return {
			map,
			olMap,
			movingSource,
			mousePosition,
			vectorLayer,
			moveFeature,
			animating,
			clickHandler,
			gobackHandler,
		}
	},
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

.map {
	width: 100%;

	height: 100%;
}
.btn__wrapper {
	display: flex;
	gap: 2rem;
}
button {
	padding: 0.3rem 0.5rem;
	border: none;
	background-color: #327959;
	border-radius: 0.5rem;
	color: white;
}
button:hover {
	background-color: #42d392;
	cursor: pointer;
}
</style>
