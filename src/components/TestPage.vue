<template>
	<div>THIS IS TEST PAGE</div>
	<ol-map>
		<ol-view :center="center" />
		<ol-layer-tile :source="osm">
			<ol-source-osm />
		</ol-layer-tile>
	</ol-map>
</template>

<script>
import OlLayerTile from 'ol/layer/Tile.js'
import OlView from 'ol/View.js'
import OlMap from 'ol/Map.js'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj.js'

export default {
	name: 'TestPage',
	components: [OlMap, OlLayerTile, OlView],

	setup() {
		const osm = new OSM()
		const center = fromLonLat([126.9251405697578, 37.53033241217628])
		return { osm, center }
	},
}
</script>

<style scoped>
.map {
	width: 100vw;
	height: 100%;
}
</style>
