import { createWebHistory, createRouter } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import MainMap from '@/components/MainMap.vue'
import TestPage from '@/components/TestPage.vue'

const routes = [
	// lazy-loading 은 나중에...
	// { path: '/', name: 'HelloWorld', component: () => import(HelloWorld) },
	{ path: '/', name: 'HelloWorld', component: HelloWorld },
	{ path: '/map', name: 'MainMap', component: MainMap },
	{ path: '/test', name: 'TestPage', component: TestPage },
]

// export const router = createRouter({
// 	history: createWebHistory(),
// 	routes,
// })

const router = createRouter({
	history: createWebHistory(),
	routes,
})
export default router
