export interface TransactionReceiptResponse {
	transaction_hash: string;
	status: 'NOT_RECEIVED' | 'RECEIVED' | 'PENDING' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1' | 'REJECTED';
	actual_fee?: string;
	messages_sent?: any;
	events?: Array<Event>;
}
