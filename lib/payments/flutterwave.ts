const FLW_BASE_URL = process.env.FLUTTERWAVE_BASE_URL ?? "https://api.flutterwave.com";

export type FlutterwavePaymentInitInput = {
  txRef: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
  };
  redirectUrl: string;
  customizations: {
    title: string;
    description: string;
  };
};

export type FlutterwaveTransferInput = {
  accountBank: string;
  accountNumber: string;
  amount: number;
  currency: string;
  reference: string;
  narration: string;
};

type FlutterwaveResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};

const getSecretKey = () => {
  const key = process.env.FLW_SECRET_KEY ?? process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing Flutterwave secret key. Set FLW_SECRET_KEY.");
  }
  return key;
};

const flutterwaveRequest = async <T>(path: string, init?: RequestInit): Promise<FlutterwaveResponse<T>> => {
  const response = await fetch(`${FLW_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSecretKey()}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as FlutterwaveResponse<T>;

  if (!response.ok || payload.status !== "success") {
    throw new Error(payload.message || `Flutterwave request failed (${response.status}).`);
  }

  return payload;
};

export const initializeFlutterwavePayment = async (input: FlutterwavePaymentInitInput) => {
  const payload = await flutterwaveRequest<{ link: string }>("/v3/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      customer: {
        email: input.customer.email,
        name: input.customer.name,
      },
      customizations: input.customizations,
    }),
  });

  return payload.data;
};

export const verifyFlutterwaveTransaction = async (transactionId: string) => {
  const payload = await flutterwaveRequest<{
    id: number;
    tx_ref: string;
    amount: number;
    charged_amount: number;
    currency: string;
    status: string;
  }>(`/v3/transactions/${transactionId}/verify`, {
    method: "GET",
  });

  return payload.data;
};

export const createFlutterwaveTransfer = async (input: FlutterwaveTransferInput) => {
  const payload = await flutterwaveRequest<{
    id: number;
    reference: string;
    status: string;
  }>("/v3/transfers", {
    method: "POST",
    body: JSON.stringify({
      account_bank: input.accountBank,
      account_number: input.accountNumber,
      amount: input.amount,
      currency: input.currency,
      narration: input.narration,
      reference: input.reference,
      callback_url: process.env.FLUTTERWAVE_TRANSFER_CALLBACK_URL || undefined,
      debit_currency: input.currency,
    }),
  });

  return payload.data;
};
