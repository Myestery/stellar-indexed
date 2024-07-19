import { ref } from "vue";

export function useNetworkSwitch() {
  const isMainnet = ref(false); // Default is Testnet
  const network = ref("Testnet");
  const rpcUrl = ref("https://soroban-testnet.stellar.org");

  function toggleNetwork() {
    isMainnet.value = !isMainnet.value;
    network.value = isMainnet.value ? "Mainnet" : "Testnet";
    rpcUrl.value = isMainnet.value
      ? "https://horizon.stellar.org"
      : "https://soroban-testnet.stellar.org";
  }

  return {
    isMainnet,
    network,
    toggleNetwork,
  };
}
