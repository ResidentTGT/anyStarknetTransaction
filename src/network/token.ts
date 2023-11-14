import { ethers } from 'ethers';

const ETHEREUM_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'USDT',
		address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
	},
	{
		symbol: 'USDC',
		address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	},
	{
		symbol: 'WETH',
		address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	},
	{
		symbol: 'BTC.b',
		address: '0x2297aEbD383787A160DD0d9F71508148769342E3',
	},
	{
		symbol: 'rETH',
		address: '0xae78736cd615f374d3085123a210448e74fc6393',
	},
	{
		symbol: 'DAI',
		address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
	},
	{
		symbol: 'BUSD',
		address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
	},
];

const OPTIMISM_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'OP',
		address: '0x4200000000000000000000000000000000000042',
	},
	{
		symbol: 'USDT',
		address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
	},
	{
		symbol: 'USDC',
		address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
	},
	{
		symbol: 'sUSD',
		address: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
	},
	{
		symbol: 'DAI',
		address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
	},
	{
		symbol: 'STG',
		address: '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97',
	},
	{
		symbol: 'agEUR',
		address: '0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED',
	},
	{
		symbol: 'BTC.b',
		address: '0x2297aEbD383787A160DD0d9F71508148769342E3',
	},
	{
		symbol: 'BUSD',
		address: '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39',
	},
	{
		symbol: 'WETH',
		address: '0x4200000000000000000000000000000000000006',
	},
];

const ARBITRUM_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'ARB',
		address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
	},
	{
		symbol: 'USDT',
		address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
	},
	{
		symbol: 'USDC.e',
		address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
	},
	{
		symbol: 'USDC',
		address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
	},
	{
		symbol: 'SPELL',
		address: '0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF',
	},
	{
		symbol: 'STG',
		address: '0x6694340fc020c5e6b96567843da2df01b2ce1eb6',
	},
	{
		symbol: 'RDNT',
		address: '0x3082cc23568ea640225c2467653db90e9250aaa0',
	},
	{
		symbol: 'WETH',
		address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
	},
	{
		symbol: 'CDAILP',
		address: '0x61B3184be0c95324BF00e0DE12765B5f6Cc6b7cA',
	},
	{
		symbol: 'DAI',
		address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
	},
	{
		symbol: 'agEUR',
		address: '0xfa5ed56a203466cbbc2430a43c66b9d8723528e7',
	},
	{
		symbol: 'BTC.b',
		address: '0x2297aEbD383787A160DD0d9F71508148769342E3',
	},
];

const POLYGON_TOKENS: Token[] = [
	{
		symbol: 'MATIC',
		address: ethers.ZeroAddress,
		// address: '0x0000000000000000000000000000000000001010',
	},
	{
		symbol: 'USDC',
		address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
	},
	{
		symbol: 'USDT',
		address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
	},
	{
		symbol: 'DAI',
		address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
	},
	{
		symbol: 'agEUR',
		address: '0xe0b52e49357fd4daf2c15e02058dce6bc0057db4',
	},
	{
		symbol: 'BTC.b',
		address: '0x2297aEbD383787A160DD0d9F71508148769342E3',
	},
	{
		symbol: 'WMATIC',
		address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
	},
	{
		symbol: 'WETH',
		address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
	},
];

const GOERLI_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
];

const ZKSYNC_ERA_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'WETH',
		address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
	},
	{
		symbol: 'USDC',
		address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
	},
	{
		symbol: 'USDT',
		address: '0x493257fd37edb34451f62edf8d2a0c418852ba4c',
	},
	{
		symbol: 'WBTC',
		address: '0xbbeb516fb02a01611cbbe0453fe3c580d7281011',
	},
	{
		symbol: 'rfETH',
		address: '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6',
	},
	{
		symbol: 'rfUSDC',
		address: '0x04e9Db37d8EA0760072e1aCE3F2A219988Fdac29',
	},
	{
		symbol: 'rfUSDT',
		address: '0x894cccB9908A0319381c305f947aD0EF44838591',
	},
	{
		symbol: 'rfWBTC',
		address: '0x0a976E1E7D3052bEb46085AcBE1e0DAccF4A19CF',
	},
];

const BNB_TOKENS: Token[] = [
	{
		symbol: 'BNB',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'agEUR',
		address: '0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89',
	},
	{
		symbol: 'BTC.b',
		address: '0x2297aEbD383787A160DD0d9F71508148769342E3',
	},
	{
		symbol: 'USDT',
		address: '0x55d398326f99059ff775485246999027b3197955',
	},
	{
		symbol: 'USDC',
		address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
	},
	{
		symbol: 'DAI',
		address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
	},
	{
		symbol: 'WETH',
		address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
	},
	{
		symbol: 'WBNB',
		address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
	},
];

const FTM_TOKENS: Token[] = [];

const AVAX_TOKENS: Token[] = [
	{
		symbol: 'BTC.b',
		address: '0x152b9d0fdc40c096757f570a51e494bd4b943e50',
	},
	{
		symbol: 'USDC',
		address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
	},
];

const APTOS_TOKENS: Token[] = [
	{
		symbol: 'BTC.b',
		address: '0x8b107b816356295ea62750020edea701bfc6d11575953d0e146c20d7b9409300::oft::BTCbOFT',
	},
];
const STARKNET_TOKENS: Token[] = [
	{ symbol: 'ETH', address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
	{ symbol: 'USDC', address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' },
	{ symbol: 'USDT', address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8' },
	{ symbol: 'DAI', address: '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3' },
	{ symbol: 'wBTC', address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac' },
];

const SUI_TOKENS: Token[] = [
	{ symbol: 'SUI', address: '0x2::sui::SUI' },
	{ symbol: 'USDC', address: '0x168da5bf1f48dafc111b0a488fa454aca95e0b5e::usdc::USDC' },
];
const ZORA_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
];
const BASE_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
];
const CELO_TOKENS: Token[] = [
	{
		symbol: 'CELO',
		address: ethers.ZeroAddress,
	},
];
const LINEA_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
	{
		symbol: 'USDC',
		address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
	},
	{
		symbol: 'lETH',
		address: '0xc7D8489DaE3D2EbEF075b1dB2257E2c231C9D231',
	},
	{
		symbol: 'lUSDC',
		address: '0x2aD69A0Cf272B9941c7dDcaDa7B0273E9046C4B0',
	},
];
const OPBNB_TOKENS: Token[] = [
	{
		symbol: 'BNB',
		address: ethers.ZeroAddress,
	},
];
const SCROLL_TOKENS: Token[] = [
	{
		symbol: 'ETH',
		address: ethers.ZeroAddress,
	},
];

export abstract class Tokens {
	public static readonly Ethereum: Token[] = ETHEREUM_TOKENS;
	public static readonly Optimism: Token[] = OPTIMISM_TOKENS;
	public static readonly Arbitrum: Token[] = ARBITRUM_TOKENS;
	public static readonly Polygon: Token[] = POLYGON_TOKENS;
	public static readonly Bnb: Token[] = BNB_TOKENS;
	public static readonly Fantom: Token[] = FTM_TOKENS;
	public static readonly Avalanche: Token[] = AVAX_TOKENS;
	public static readonly Goerli: Token[] = GOERLI_TOKENS;
	public static readonly ZksyncEra: Token[] = ZKSYNC_ERA_TOKENS;
	public static readonly Aptos: Token[] = APTOS_TOKENS;
	public static readonly Starknet: Token[] = STARKNET_TOKENS;
	public static readonly Zora: Token[] = ZORA_TOKENS;
	public static readonly Base: Token[] = BASE_TOKENS;
	public static readonly Sui: Token[] = SUI_TOKENS;
	public static readonly Celo: Token[] = CELO_TOKENS;
	public static readonly Linea: Token[] = LINEA_TOKENS;
	public static readonly OpBNB: Token[] = OPBNB_TOKENS;
	public static readonly Scroll: Token[] = SCROLL_TOKENS;
}

export type Token = {
	symbol: string;
	address: string;
};

export default Tokens;
