import { ref } from "vue";

export function useNetworkSwitch() {
  const isMainnet = ref(localStorage.getItem("isMainnet") === "true");
  const network = ref(isMainnet.value ? "Mainnet" : "Testnet");
  const rpcUrl = ref(
    isMainnet.value
      ? "https://us-central1-stellar-indexed.cloudfunctions.net/quickNodeQuery"
      : "https://soroban-testnet.stellar.org"
  );

  function toggleNetwork() {
    isMainnet.value = !isMainnet.value;
    network.value = isMainnet.value ? "Mainnet" : "Testnet";
    rpcUrl.value = isMainnet.value
      ? "https://us-central1-stellar-indexed.cloudfunctions.net/quickNodeQuery"
      : "https://soroban-testnet.stellar.org";
    localStorage.setItem("isMainnet", isMainnet.value);
  }

  return {
    isMainnet,
    network,
    toggleNetwork,
    rpcUrl,
  };
}
