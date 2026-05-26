import { FedaPay, Transaction } from 'fedapay';

// Initialisation avec tes variables d'environnement
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);

// On utilise 'sandbox' pour tes tests, tu changeras en 'live' plus tard
FedaPay.setEnvironment('sandbox'); 

export { Transaction };