import crypto from "crypto";

const BINANCE_API_URL =
  process.env.STAGE === "dev"
    ? "https://testnet.binance.vision"
    : "https://api.binance.com";

const API_KEY =
  process.env.STAGE === "dev"
    ? process.env.BINANCE_API_KEY
    : process.env.BINANCE_API_KEY_PROD;
const API_SECRET =
  process.env.STAGE === "dev"
    ? process.env.BINANCE_API_SECRET
    : process.env.BINANCE_API_SECRET_PROD;

function createSignature(queryString: string): string {
  return crypto
    .createHmac("sha256", API_SECRET!)
    .update(queryString)
    .digest("hex");
}

export async function getAccountBalance() {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Faltan API_KEY o API_SECRET");
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;

  const signature = createSignature(queryString);
  const url = `${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-MBX-APIKEY": API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Binance: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  // Filtrar solo activos con saldo > 0
  const balances = data.balances.filter(
    (b: { free: string; locked: string }) =>
      parseFloat(b.free) > 0 || parseFloat(b.locked) > 0,
  );

  return {
    accountType: data.accountType,
    balances: balances.map(
      (b: { asset: string; free: string; locked: string }) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      }),
    ),
  };
}
