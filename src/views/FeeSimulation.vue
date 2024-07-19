<template>
  <form @submit.prevent="sendTransaction" class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Stellar Transaction Sender</h1>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"
        >Input Type</label
      >
      <select v-model="inputType" class="w-full p-2 border rounded-md">
        <option value="xdr">Transaction XDR</option>
        <option value="contract">Contract Details</option>
      </select>
    </div>

    <div v-if="inputType === 'xdr'" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"
        >Transaction XDR</label
      >
      <textarea
        v-model="transactionXdr"
        rows="4"
        class="w-full p-2 border rounded-md"
      ></textarea>
    </div>

    <div v-if="inputType === 'contract'" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Contract Address</label
        >
        <input
          v-model="contractAddress"
          required
          type="text"
          class="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Function Name</label
        >
        <input
          v-model="functionName"
          required
          type="text"
          class="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Base Fee</label
        >
        <input
          v-model="feeSetting"
          required
          type="number"
          class="w-full p-2 border rounded-md"
          min="100"
        />
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-4">Contract Parameters</h2>
        <div
          v-for="(param, index) in contractParams"
          :key="index"
          class="flex space-x-4 mb-4"
        >
          <select
            v-model="param.type"
            class="flex-1 p-2 border rounded-md"
            required
          >
            <option v-for="type in validTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          <input
            v-model="param.value"
            :type="
              param.type === 'bool'
                ? 'checkbox'
                : ['i32', 'i64', 'i128', 'u32', 'u64', 'u128'].includes(
                    param.type
                  )
                ? 'number'
                : 'text'
            "
            required
            placeholder="Value"
            class="flex-1 p-2 border rounded-md"
          />
          <button
            @click="removeParam(index)"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Remove
          </button>
        </div>
        <button
          @click="addParam"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Parameter
        </button>
      </div>
    </div>

    <button
      type="submit"
      class="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      Send Transaction
    </button>

    <div v-if="result" class="mt-6 p-4 bg-gray-100 rounded">
      <h2 class="text-xl font-semibold mb-2">Result</h2>
      <pre class="whitespace-pre-wrap">{{ result }}</pre>
    </div>
  </form>
</template>

<script>
import { Buffer } from "buffer";
import { ref } from "vue";
import * as StellarSdk from "@stellar/stellar-sdk";
// import { Server } from "@stellar/stellar-sdk/rpc";
import { useNetworkSwitch } from "@/composables/useNetworkSwitch";
import { prepareTransaction } from "@stellar/stellar-sdk/rpc";
import {
  isConnected,
  setAllowed,
  getPublicKey,
  signAuthEntry,
  signTransaction,
  signBlob,
} from "@stellar/freighter-api";
window.Buffer = window.Buffer || Buffer;

export default {
  setup() {
    const inputType = ref("contract");
    const transactionXdr = ref("");
    const contractAddress = ref("");
    const functionName = ref("");
    const contractParams = ref([]);
    const result = ref("");
    const feeSetting = ref(100);
    const { rpcUrl, isMainnet } = useNetworkSwitch();

    const server = new StellarSdk.SorobanRpc.Server(rpcUrl.value);
    const sourceSecretKey =
      "SBFNHYKPKP2PVBWEPFYKJ2PZJ4YGL457EGWOKTOUYN7NHV3TIJMXHDZ5";
    const accountId =
      "GCD2XWYQOOKD2GEVAEYFABLSN735KARTHQBGWBTOPGEIACLOLM5HYOGD";
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);

    const validTypes = [
      "i32",
      "i64",
      "i128",
      "u32",
      "u64",
      "u128",
      "bool",
      "symbol",
      "string",
      "address",
    ];

    const addParam = () => {
      contractParams.value.push({ type: "i32", value: "" });
    };

    const removeParam = (index) => {
      contractParams.value.splice(index, 1);
    };

    const sendTransaction = async () => {
      try {
        if (inputType.value === "xdr") {
          // Process XDR transaction
          result.value = "XDR transaction processing not implemented";
        } else {
          // Process contract transaction

          // if using mainnet, must use freighter
          let hasFreighter = await isConnected();
          if (!hasFreighter && isMainnet.value) {
            return alert(
              "Freighter wallet is required for mainnet transactions"
            );
          }
          const isAllowed = await setAllowed();
          if (!isAllowed) {
            return alert("Please allow the transaction in Freighter wallet");
          }
          const contract = new StellarSdk.Contract(contractAddress.value);
          const account = await server.getAccount(accountId);
          const fee = String(feeSetting.value);

          const transaction = new StellarSdk.TransactionBuilder(account, {
            fee,
            networkPassphrase: isMainnet
              ? StellarSdk.Networks.PUBLIC
              : StellarSdk.Networks.TESTNET,
          })
            .setTimeout(30)
            .addOperation(
              contract.call(
                functionName.value,
                ...contractParams.value.map((param) =>
                  StellarSdk.nativeToScVal(param.value, { type: param.type })
                )
              )
            )
            .build();

          let preparedTransaction = await server.prepareTransaction(transaction);
          let signedTransaction;
          if (hasFreighter) {
            let signedXDR = await signTransaction(
              preparedTransaction.toEnvelope().toXDR("base64")
            );
            signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
              signedXDR,
              isMainnet
                ? StellarSdk.Networks.PUBLIC
                : StellarSdk.Networks.TESTNET
            );
          } else {
            preparedTransaction.sign(sourceKeypair);
            signedTransaction = preparedTransaction;
          }
          result.value = preparedTransaction.toEnvelope().toXDR("base64");

          // try to simulate the transaction
          const res = await server.simulateTransaction(signedTransaction);
          console.log(res);
          result.value = {
            minResourceFee: res.minResourceFee,
            minResourceFeeInXLM: +res.minResourceFee / 10000000,
          };
        }
      } catch (error) {
        console.error(error);
        result.value = `Error sending transaction: ${error}`;
      }
    };

    return {
      inputType,
      transactionXdr,
      contractAddress,
      functionName,
      contractParams,
      validTypes,
      result,
      addParam,
      removeParam,
      sendTransaction,
      feeSetting,
    };
  },
};
</script>
