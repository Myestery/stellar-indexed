import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/fee-estimation",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/FeeEstimation.vue"),
    },
    {
      name: "Fee simulation",
      path: "/fee-simulation",
      component: () => import("../views/FeeSimulation.vue"),
    },
    {
      name: "Fee history tracking",
      path: "/fee-history",
      component: () => import("../views/FeeHistory.vue"),
    },
  ],
});

export default router;
