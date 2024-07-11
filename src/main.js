import "./assets/main.css";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";

import App from "./App.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp } from "vue";
import router from "./router";

const apiToken = import.meta.env.VITE_API_TOKEN;

const httpLink = createHttpLink({
  uri: `https://api.blockeden.xyz/stellar/mainnet/soroban/indexer/${apiToken}/v1/graphql`,
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const app = createApp(App);

app.provide(DefaultApolloClient, apolloClient);
app.use(router);
app.mount("#app");
