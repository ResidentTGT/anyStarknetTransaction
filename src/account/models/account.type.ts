import { BrowserExtension } from './browserExtension.type';
import { Cex } from './cex.type';
import { Proxy } from './proxy.type';
import { SocialAccount } from './socialAccount.type';
import { Wallet } from './wallet.type';

export type Account = {
	name?: string;
	browser?: {
		id: string;
	};
	seeds?: {
		'12'?: string;
		'24'?: string;
	};
	wallets?: {
		evm?: Wallet;
		starknet?: Wallet;
		aptos?: Wallet;
		sui?: Wallet;
	};
	cexs?: {
		okx?: Cex;
		binance?: Cex;
	};
	extensions?: {
		metamask?: BrowserExtension;
		martian?: BrowserExtension;
		argent?: BrowserExtension;
		suiWallet?: BrowserExtension;
		ethosWallet?: BrowserExtension;
	};
	socials?: {
		twitter?: SocialAccount;
		discord?: SocialAccount;
		mail?: Omit<SocialAccount, 'mail'>;
	};
	github?: {
		token?: string;
	};
	proxy?: Proxy;
	extdata?: any;
};
