import { createApp } from "vue";
import Antdv from "antdv-next";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import store from "./store/index";
import VxeUIBase from "vxe-pc-ui";
import "vxe-pc-ui/es/style.css";

import VxeUITable from "vxe-table";
import "vxe-table/es/style.css";

const app = createApp(App);
app.use(VxeUIBase);
app.use(VxeUITable);
app.use(Antdv);
app.use(store);
app.use(router);
app.mount("#app");
