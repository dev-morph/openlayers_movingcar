<template>
	<div class="map__wrapper">
		<div class="btn__wrapper">
			<button @click="clickHandler">
				{{ animating ? 'Stop Car' : 'Move Car' }}
			</button>

			<button @click="gobackHandler">Go Back</button>

			<button @click="drawModeHandler" :class="{ activeDrawMode: drawMode }">
				{{ drawMode ? '경로 그리기 모드 정지' : '경로 그리기 모드 시작' }}
			</button>

			<button @click="rotateHandler">ROTATE ARROW</button>
		</div>

		<div class="map" ref="map"></div>
		<div class="dot" id="dot" ref="dot">
			<div class="arrow" id="arrow"></div>
		</div>
		<div class="popup" id="popup" ref="popUp">
			<div class="popup__content" ref="content">
				<p>
					위도:
					{{ popupContent.position.length > 0 && popupContent.position[1] }}
				</p>
				<p>
					경도:
					{{ popupContent.position.length > 0 && popupContent.position[0] }}
				</p>
				<p>detail: {{ popupContent.desc }}</p>
			</div>
		</div>
	</div>
</template>

<script>
import OlLayerTile from 'ol/layer/Tile.js'
import OlView from 'ol/View.js'
import OlMap from 'ol/Map.js'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import { fromLonLat, toLonLat } from 'ol/proj.js'
import { defaults } from 'ol/control.js'
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Style, Circle as CircleStyle, Stroke, Fill } from 'ol/style'
import Feature from 'ol/Feature'
import { Point, MultiLineString } from 'ol/geom'
import { getVectorContext } from 'ol/render'
import Overlay from 'ol/Overlay.js'
import {
	MapMaster,
	createCustomFeature,
	createVectorSource,
	createVectorLayer,
} from '@/util/mapManager'

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
						radius: 10,
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
						radius: 20,
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
						radius: 30,
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
						radius: 40,
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
						radius: 20,
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
						radius: 30,
					},
				},
			],
		}
		// const testGeoJson2 = {
		// 	type: 'FeatureCollection',
		// 	features: [
		// 		{
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [126.92255273626091, 37.52895159476866],
		// 			},
		// 			properties: {
		// 				heading: 1.3,
		// 				radius: 10,
		// 			},
		// 		},

		// 		{
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [126.92193795286411, 37.52859742232047],
		// 			},

		// 			properties: {
		// 				heading: 1.5,
		// 				radius: 20,
		// 			},
		// 		},

		// 		{
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [126.91977682772502, 37.530770776174876],
		// 			},

		// 			properties: {
		// 				heading: 1.7,
		// 				radius: 30,
		// 			},
		// 		},

		// 		{
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [126.92036867057597, 37.531144586357684],
		// 			},

		// 			properties: {
		// 				heading: 1.8,
		// 				radius: 40,
		// 			},
		// 		},

		// 		{
		// 			type: 'Feature',
		// 			geometry: {
		// 				type: 'Point',
		// 				coordinates: [126.92255273626091, 37.52895159476866],
		// 			},

		// 			properties: {
		// 				heading: 1.9,
		// 				radius: 20,
		// 			},
		// 		},
		// 	],
		// }
		const animating = ref(false)
		const drawMode = ref(false)
		const map = ref(null)
		const popUp = ref()
		const content = ref()
		const popupContent = reactive({ position: [], desc: null })
		const popupShow = ref(false)

		const dot = ref(null)
		const degree = ref(0)

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
					fill: new Fill({ color: [255, 0, 0, 0.7] }),
					stroke: new Stroke({
						color: [160, 51, 255, 0.7],
						width: 3,
					}),
				}),
			}),

			MultiLineString: new Style({
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

		// 스타일 적용 함수
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
				pauseAnimation()
			}
		}

		function drawModeHandler() {
			drawMode.value = !drawMode.value
			console.log(drawMode.value)
		}

		const duration = 1000

		let start

		const currentIndex = ref(0)

		function moveFeature(event) {
			const frameState = event.frameState
			const elapsedTime = frameState.time - start
			const currentFeature = features[currentIndex.value]
			const nextFeature = features[currentIndex.value + 1]
			const from = currentFeature.getGeometry().getCoordinates()

			let to
			let carStyle

			if (currentIndex.value === features.length - 1) {
				to = features[0].getGeometry().getCoordinates()

				carStyle = styles['Car']
			} else {
				to = nextFeature.getGeometry().getCoordinates()
				carStyle = new Style({
					image: new CircleStyle({
						radius: nextFeature.getProperties().properties.radius,
						fill: new Fill({ color: [255, 0, 0, 0.7] }),
						stroke: new Stroke({
							color: [160, 51, 255, 0.7],
							width: 3,
						}),
					}),
				})
			}

			// duration에 도달 했다면, 이는 도착 위치에 도달 했다는 뜻.
			// currentIndex.value를 하나 늘리고, 다시 반복하면 된다.
			// 단, currentIndex.value가 features.length에 도달하기 전까지 postrender이벤트를 멈추면 안되고,
			// 도달 했을 때에만 postrender이벤트를 unlisten 하기 위해, stopAnimation()을 호출 한다.

			if (elapsedTime >= duration) {
				if (++currentIndex.value >= features.length) {
					stopAnimation()
					carPosition.setCoordinates(from)
					return
				}
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

			// 구한 현재 좌표와 스타일을 적용시킨다.

			carPosition.setCoordinates(currentPosition.getCoordinates())

			// 여기서 heading 값을 이용하여
			// styles['car'].getImage().setRotation(flipRotation)
			// 형식으로 rotation 값을 변경 해 줄 수 있다.

			vectorContext.setStyle(carStyle)
			vectorContext.drawGeometry(carPosition)
			olMap.render()
		}

		function gobackHandler() {
			if (currentIndex.value === 0) {
				startAnimation()
				stopAnimation()
			} else {
				currentIndex.value--
			}
		}

		function startAnimation() {
			//팝업이 켜져 있다면, 꺼주고 애니메이션 start
			if (popupShow.value) {
				popUpHandler()
			}
			animating.value = true
			start = Date.now()
			vectorLayer.on('postrender', moveFeature)
			carFeature.setGeometry(null)
		}

		function pauseAnimation() {
			animating.value = false
			start = Date.now()
			vectorLayer.un('postrender', moveFeature)
			//초기화
			carFeature.setGeometry(carPosition)
		}

		function stopAnimation() {
			animating.value = false
			start = Date.now()
			vectorLayer.un('postrender', moveFeature)
			//초기화
			carFeature.setGeometry(carPosition)
			currentIndex.value = 0
		}

		const multiLine = new MultiLineString([
			features.map((feature) => feature.getGeometry().getCoordinates()),
		])

		const lineFeature = new Feature(multiLine)
		const startPosition = new Point(multiLine.getCoordinates()[0][0])
		const carPosition = startPosition.clone()
		const carFeature = createCustomFeature({
			id: 1,
			type: 'Car',
			geometry: carPosition,
		})

		// const movingSource = createVectorSource([lineFeature, carFeature]) //Vector layer 선언
		const movingSource = createVectorSource([carFeature]) //Vector layer 선언

		const vectorLayer = createVectorLayer(movingSource, styleHandler)

		function popUpHandler(coordinates) {
			// 팝업 없는 경우, 표시
			if (
				popupLayer.getPosition() === undefined &&
				coordinates !== undefined &&
				Array.isArray(coordinates) &&
				!popupShow.value
			) {
				popupShow.value = true
				popupLayer.setPosition(coordinates)
			}
			// 이미 팝업이 visible 한 상태에서 클릭한 경우, 없애준다.
			else if (popupLayer.getPosition() !== undefined && popupShow.value) {
				popupShow.value = false
				popupLayer.setPosition(undefined)
			}
		}

		function rotateHandler() {
			degree.value += 45
			const element = document.querySelector('#arrow')
			// element.style.transform = 'translate(-50%, -50%) rotate(90deg)'
			element.animate(
				{
					transform: [`translate(-50%, -50%) rotate(${degree.value}deg)`],
				},
				{
					duration: 500,
					fill: 'forwards',
					easing: 'ease',
				}
			)
		}

		// Map Config
		let mapMaster
		let olMap
		let popupLayer
		let dotLayer
		onMounted(() => {
			mapMaster = new MapMaster(map.value, center)
			mapMaster.addLayer(vectorLayer)
			// popupLayer = mapMaster.createOverlay(dot.value)
			popupLayer = mapMaster.createOverlay(popUp.value)
			dotLayer = new Overlay({
				element: dot.value,
				stopEvent: false,
				autoPan: false,
			})
			mapMaster.addOverlay(popupLayer)
			mapMaster.addOverlay(dotLayer)

			olMap = mapMaster.getOlMap()

			// if you want to add event on Map Object,
			// you can add event like below,

			olMap.on('click', (event) => {
				const currentPosition = toLonLat(event.coordinate)
				const feat = mapMaster.getFeaturesByEvent(event)

				// 클릭 대상이 Car인 경우에만, 자동차 상세정보를 보여주는 팝업 표시
				if (feat && feat.get('type') === 'Car') {
					const currentCoordinates = feat.getGeometry().getCoordinates()
					popupContent.position = toLonLat(currentCoordinates)
					popupContent.desc =
						features[currentIndex.value].getProperties().properties

					popUpHandler(currentCoordinates)
				}
				// 팝업이 나와 있는 경우에 화면을 클릭한다면 펼쳐진 팝업을 제거한다.
				else if (popupLayer.getPosition() !== undefined && popupShow.value) {
					popUpHandler()
				}

				if (drawMode.value) {
					alert('here')
				}
			})

			olMap.on('pointermove', (event) => {
				const feat = olMap.forEachFeatureAtPixel(
					event.pixel,
					function (feature, layer) {
						return feature
					}
				)
				if (feat && feat.get('type') === 'Car') {
					olMap.getTargetElement().style.cursor = 'pointer'
				}
				// else if(drawMode){
				// }
				else {
					olMap.getTargetElement().style.cursor = ''
				}
			})

			dotLayer.setPosition(fromLonLat([126.92179651968831, 37.5314476361026]))
		})

		onBeforeUnmount(() => {
			// Clean up resources about MapMaster Object to rerender when routing is activated!
			MapMaster.olMap = null
		})

		return {
			//variables
			mapMaster,
			map,
			popUp,
			content,
			olMap,
			popupLayer,
			popupContent,
			movingSource,
			vectorLayer,
			moveFeature,
			drawMode,
			animating,
			dot,
			degree,
			//function
			clickHandler,
			gobackHandler,
			popUpHandler,
			drawModeHandler,
			rotateHandler,
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

.activeDrawMode {
	background-color: rgb(255, 68, 68);
}
.activeDrawMode:hover {
	background-color: rgb(255, 101, 101);
}

.popup {
	position: absolute;
	background-color: white;
	/*--webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));*/
	filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
	padding: 15px;
	border-radius: 10px;
	border: 1px solid #cccccc;
	bottom: 12px;
	left: -50px;
	min-width: 180px;
	font-size: 0.7rem;
}

.popup::after,
.popup::before {
	top: 100%;
	border: solid transparent;
	content: '';
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
}
.popup::after {
	border-top-color: white;
	border-width: 10px;
	left: 48px;
	margin-left: -10px;
}

.dot {
	content: '';
	width: 0.85rem;
	height: 0.85rem;
	position: absolute;
	background-color: #0475f4;
	border-radius: 50%;
	border: 2px solid whitesmoke;
	box-shadow: 0px 0px 10px 2px #0475f4, 0px 0px 0px 10px rgba(4, 117, 244, 0.2);
}

.arrow {
	width: 0px;
	height: 1.8rem;
	background-color: black;
	position: absolute;
	/* top: -50%; */
	/* left: 50%; */
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	/* transform: translate(-50%, -50%) rotate(90deg); */
}
.arrow::after {
	content: '';
	width: 0px;
	height: 0px;
	border-top: 0px solid transparent;
	border-bottom: 6px solid rgba(4, 117, 244, 1);
	/* border-bottom: 6px solid red; */
	border-left: 3px solid transparent;
	border-right: 3px solid transparent;
	position: absolute;
	top: 0;
	left: 50%;
	transform: translate(-50%, 0%);
}

/* .dot::after {
	content: '';
	width: 0px;
	height: 0px;
	border-top: 0px solid transparent;
	border-bottom: 6px solid rgba(4, 117, 244, 1);
	border-left: 3px solid transparent;
	border-right: 3px solid transparent;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
} */
</style>
