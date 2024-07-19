<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Stellar Fee Estimation</h1>

    <div class="mb-4">
      <button
        @click="addOperation"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Operation
      </button>
    </div>

    <div
      v-for="(operation, index) in operations"
      :key="index"
      class="mb-4 p-4 border rounded"
    >
      <h2 class="text-xl font-semibold mb-2">Operation {{ index + 1 }}</h2>

      <div class="mb-2">
        <label class="block text-sm font-medium text-gray-700"
          >Operation Type</label
        >
        <select
          v-model="operation.type"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option v-for="type in operationTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div v-if="operation.type == 'invokeHostFunction'" class="mb-2">
        <label class="block text-sm font-medium text-gray-700">{{
          " Using Counter Contract"
        }}</label>
        <input
          readonly
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          value="CC6MWZMG2JPQEENRL7XVICAY5RNMHJ2OORMUHXKRDID6MNGXSSOJZLLF"
        />
      </div>

      <button
        @click="removeOperation(index)"
        class="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
      >
        Remove
      </button>
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium text-gray-700"
        >Effective Inclusion fee (in stroops)</label
      >
      <input
        v-model.number="effectiveBaseFee"
        type="number"
        min="100"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      />
    </div>

    <div class="mt-4">
      <button
        @click="calculateFee"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Calculate Fee
      </button>
    </div>

    <div v-if="estimatedFee !== null" class="mt-4 p-4 bg-gray-100 rounded">
      <h2 class="text-xl font-semibold mb-2">Estimated Fee</h2>
      <p>
        Minimum Fee: {{ estimatedFee }} stroops ({{
          stroopsToXLM(estimatedFee)
        }}
        XLM)
      </p>
      <p>
        Estimated Resource Fee: {{ estimatedResourceFee }} stroops ({{
          stroopsToXLM(estimatedResourceFee)
        }}
        XLM)
      </p>
      <p>
        Recommended Fee: {{ Math.round(estimatedFee * 1.5) }} stroops ({{
          stroopsToXLM(Math.round(estimatedFee * 1.5))
        }}
        XLM)
      </p>
      <p>
        Maximum Fee:
        {{ Math.min(estimatedFee * 10, Number.MAX_SAFE_INTEGER) }} stroops ({{
          stroopsToXLM(Math.min(estimatedFee * 10, Number.MAX_SAFE_INTEGER))
        }}
        XLM)
      </p>

      <!-- show how minimum fee was calculated -->
      <details class="mt-4 text-sm">
        <summary class="text-sm font-medium text-gray-700">
          Show Fee Calculation
        </summary>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700"
            >Minimum Fee Calculation</label
          >
          <p>
            Number of Operations: {{ operations.length }} * Effective Inclusion
            fee: {{ effectiveBaseFee }} + Estimated Resource Fee:
            {{ estimatedResourceFee }} = {{ estimatedFee }} stroops
          </p>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700"
            >Recommended Fee Calculation</label
          >
          <p class="text-sm font-medium">
            Minimum Fee: {{ estimatedFee }} * 1.5 =
            {{ Math.round(estimatedFee * 1.5) }}
            stroops
          </p>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700"
            >Maximum Fee Calculation</label
          >
          <p class="text-sm font-medium">
            Minimum Fee: {{ estimatedFee }} * 10 =
            {{ Math.min(estimatedFee * 10, Number.MAX_SAFE_INTEGER) }}
            stroops
          </p>
        </div>

        <div class="mt-4">
          Resource Fee is only calculated if the transaction includes a smart
          contract operation (invokeHostFunction)
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { useNetworkSwitch } from "@/composables/useNetworkSwitch";
const { rpcUrl } = useNetworkSwitch();
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const operations = ref([]);
const effectiveBaseFee = ref(0);
const estimatedFee = ref(null);
const estimatedResourceFee = ref(0);

onMounted(async () => {
  effectiveBaseFee.value = await displayFeeStats();
});

watch(operations.value, () => {
  estimatedFee.value = null;
});

const operationTypes = [
  "createAccount",
  "invokeHostFunction",
  "payment",
  "pathPaymentStrictReceive",
  "manageSellOffer",
  "createPassiveSellOffer",
  "setOptions",
  "changeTrust",
  "allowTrust",
  "accountMerge",
  "inflation",
  "manageData",
  "bumpSequence",
  "manageBuyOffer",
  "pathPaymentStrictSend",
  "createClaimableBalance",
  "claimClaimableBalance",
  "beginSponsoringFutureReserves",
  "endSponsoringFutureReserves",
  "revokeSponsorship",
  "clawback",
  "clawbackClaimableBalance",
  "setTrustLineFlags",
  "liquidityPoolDeposit",
  "liquidityPoolWithdraw",
];

const addOperation = () => {
  operations.value.push({
    type: operationTypes[0],
    props: {},
  });
};

const removeOperation = (index) => {
  operations.value.splice(index, 1);
};

const calculateFee = async () => {
  const numOperations = operations.value.length;
  const baseFee = await displayFeeStats();
  // if operations include invokeHostFunction, calculate simulated contract fee
  if (
    operations.value.some(
      (operation) => operation.type === "invokeHostFunction"
    )
  ) {
    estimatedResourceFee.value = await calculateSimulatedContractFee();
  }
  estimatedFee.value = numOperations * baseFee + estimatedResourceFee.value;
};

async function queryRecentFees(sorobanUrl = rpcUrl.value) {
  try {
    const response = await axios.post(`${sorobanUrl}`, {
      jsonrpc: "2.0",
      id: 8675309,
      method: "getFeeStats",
    });
    const feeStats = response.data.result;

    return {
      lastLedgerInclusionFee: {
        min: parseInt(feeStats.sorobanInclusionFee.min, 10),
        mode: parseInt(feeStats.sorobanInclusionFee.mode, 10),
        p10: parseInt(feeStats.sorobanInclusionFee.p10, 10),
        p20: parseInt(feeStats.sorobanInclusionFee.p20, 10),
        p30: parseInt(feeStats.sorobanInclusionFee.p30, 10),
        p40: parseInt(feeStats.sorobanInclusionFee.p40, 10),
        p50: parseInt(feeStats.sorobanInclusionFee.p50, 10),
        p60: parseInt(feeStats.sorobanInclusionFee.p60, 10),
        p70: parseInt(feeStats.sorobanInclusionFee.p70, 10),
        p80: parseInt(feeStats.sorobanInclusionFee.p80, 10),
        p90: parseInt(feeStats.sorobanInclusionFee.p90, 10),
        p95: parseInt(feeStats.sorobanInclusionFee.p95, 10),
        p99: parseInt(feeStats.sorobanInclusionFee.p99, 10),
        transactionCount: parseInt(
          feeStats.sorobanInclusionFee.transactionCount,
          10
        ),
        ledgerCount: parseInt(feeStats.sorobanInclusionFee.ledgerCount, 10),
      },
      feeCharged: {
        min: parseInt(feeStats.inclusionFee.min, 10),
        mode: parseInt(feeStats.inclusionFee.mode, 10),
        p10: parseInt(feeStats.inclusionFee.p10, 10),
        p20: parseInt(feeStats.inclusionFee.p20, 10),
        p30: parseInt(feeStats.inclusionFee.p30, 10),
        p40: parseInt(feeStats.inclusionFee.p40, 10),
        p50: parseInt(feeStats.inclusionFee.p50, 10),
        p60: parseInt(feeStats.inclusionFee.p60, 10),
        p70: parseInt(feeStats.inclusionFee.p70, 10),
        p80: parseInt(feeStats.inclusionFee.p80, 10),
        p90: parseInt(feeStats.inclusionFee.p90, 10),
        p95: parseInt(feeStats.inclusionFee.p95, 10),
        p99: parseInt(feeStats.inclusionFee.p99, 10),
        transactionCount: parseInt(feeStats.inclusionFee.transactionCount, 10),
        ledgerCount: parseInt(feeStats.inclusionFee.ledgerCount, 10),
      },
    };
  } catch (error) {
    console.error("Error fetching fee stats:", error);
    throw error;
  }
}

async function displayFeeStats() {
  try {
    const feeStats = await queryRecentFees();
    console.log("Recommended inclusion fee (mode):", feeStats.feeCharged.mode);
    return +feeStats.feeCharged.mode;
  } catch (error) {
    console.error("Failed to fetch fee stats");
  }
}

async function calculateSimulatedContractFee() {
  const transactionEnvelope =
    "AAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABRyoAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAAAAAAYAAAAAAAAAAG8y2WG0l8CEbFf71QIGOxaw6dOdFlD3VEaB+Y015ScnAAAAAlpbmNyZW1lbnQAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAdMSC8tQWY0Oc3+5mvhIoKetH7RtJJYiryScql8k0EKRQAAAAEAAAAGAAAAAbzLZYbSXwIRsV/vVAgY7FrDp050WUPdURoH5jTXlJycAAAAFAAAAAEACRkYAAAD0AAAAIQAAAAAAAFGxgAAAAA=";

  const response = await axios.post(
    `${rpcUrl.value}`,
    {
      jsonrpc: "2.0",
      id: 8675309,
      method: "simulateTransaction",
      params: {
        transaction: transactionEnvelope,
        resourceConfig: {
          instructionLeeway: 3000000,
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return +response.data.result.minResourceFee;
}

function stroopsToXLM(stroops) {
  return stroops / 10000000;
}
</script>
