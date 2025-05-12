import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Overview",
    component: () => import("@/views/Overview.vue"),
  },
  {
    path: "/detail/:buildingId",
    name: "Detail",
    component: () => import("@/views/Detail.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
