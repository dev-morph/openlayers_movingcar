<template>
	<div class="navi__container">
		<router-link to="/" class="navi__item">HOME</router-link>
		<router-link to="/map" class="navi__item">MAP</router-link>
		<router-link to="/test" class="navi__item">SOME</router-link>
	</div>
</template>

<script setup></script>

<style scoped>
.navi__container {
	width: 100%;
	height: 100px;
	background-color: beige;

	display: flex;
	justify-content: center;
	align-items: center;
	gap: 3rem;

	font-size: 1.5rem;
	color: black;
}

.navi__item:hover {
	cursor: pointer;
	color: rgb(84, 124, 255);
}
</style>
