export type CexApi = {
	secretKey: string;
	apiKey: string;
	passPhrase?: string;
};

export type Cex = {
	email?: string;
	evmDepositAddress?: string;
	starknetDepositAddress?: string;
	suiDepositAddress?: string;
	api?: CexApi;
};
