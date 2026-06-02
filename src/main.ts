import { createApp } from "vue";
import Antdv from "antdv-next";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import store from "./store/index";

const app = createApp(App);
app.use(Antdv);
app.use(store);
app.use(router);
app.mount("#app");
