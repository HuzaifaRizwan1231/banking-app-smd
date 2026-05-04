import firestore from '@react-native-firebase/firestore';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  location: string;
  balance: number;
  card: {
    number: string;
    holderName: string;
    expiry: string;
    type: string;
    isFrozen?: boolean;
    monthlyLimit?: number;
  };
  beneficiaries?: Array<{
    uid: string;
    displayName: string;
    email: string;
    cardType: string;
    cardNumber: string;
  }>;
}

export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  amount: number;
  date: any; // Firestore Timestamp
  type: string;
  icon: string;
  iconBg: string;
}

const usersCollection = () => firestore().collection('users');
const transactionsCollection = () => firestore().collection('transactions');

export const userService = {
  /**
   * Initializes a user document if it doesn't exist
   */
  async initializeUser(uid: string, data: Partial<UserData>) {
    try {
      const userDoc = await usersCollection().doc(uid).get();
      
      if (!userDoc.exists) {
        // Generate unique random card number
        let cardNumber = '';
        let isUnique = false;
        
        while (!isUnique) {
          const random4 = () => Math.floor(1000 + Math.random() * 9000);
          cardNumber = `${random4()} ${random4()} ${random4()} ${random4()}`;
          
          const existingCard = await usersCollection().where('card.number', '==', cardNumber).limit(1).get();
          if (existingCard.empty) {
            isUnique = true;
          }
        }
        
        // Generate expiry date (exactly 5 years in advance, random month)
        const now = new Date();
        const year = (now.getFullYear() + 5).toString().slice(-2);
        const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
        const expiry = `${month}/${year}`;

        const initialData: UserData = {
          uid,
          displayName: data.displayName || 'User',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          location: 'Not set',
          balance: 1000.00, // Starting balance for demo
          card: {
            number: cardNumber,
            holderName: data.displayName || 'User',
            expiry: expiry,
            type: Math.random() > 0.5 ? 'VIS' : 'MAS',
          },
        };
        await usersCollection().doc(uid).set(initialData);
        return initialData;
      }
      
      return userDoc.data() as UserData;
    } catch (error) {
      console.error('Error initializing user:', error);
      return null;
    }
  },

  /**
   * Gets user data by UID
   */
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await usersCollection().doc(uid).get();
      return userDoc.exists ? (userDoc.data() as UserData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Subscribes to user data changes
   */
  subscribeToUser(uid: string, callback: (data: UserData) => void) {
    return usersCollection().doc(uid).onSnapshot((doc) => {
      if (doc && doc.exists) {
        callback(doc.data() as UserData);
      }
    }, (error) => {
      console.error('User subscription error:', error);
    });
  },

  /**
   * Gets transactions for a user
   */
  async getTransactions(uid: string, limitCount?: number): Promise<Transaction[]> {
    try {
      // Removed .orderBy() to avoid composite index requirement
      let query = firestore().collection('transactions')
        .where('userId', '==', uid);
      
      const snapshot = await query.get();
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      transactions.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA; // Descending
      });

      return limitCount ? transactions.slice(0, limitCount) : transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  /**
   * Subscribes to transactions
   */
  subscribeToTransactions(uid: string, callback: (transactions: Transaction[]) => void, limitCount?: number) {
    // Removed .orderBy() to avoid composite index requirement
    let query = firestore().collection('transactions')
      .where('userId', '==', uid);
    
    return query.onSnapshot((snapshot) => {
      if (snapshot && snapshot.docs) {
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        
        // Sort in JavaScript instead of Firestore to avoid index requirement
        transactions.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA; // Descending
        });

        const result = limitCount ? transactions.slice(0, limitCount) : transactions;
        callback(result);
      }
    }, (error) => {
      console.error('Transactions subscription error:', error);
      callback([]);
    });
  },

  /**
   * Updates user profile data
   */
  async updateProfile(uid: string, data: Partial<UserData>) {
    try {
      await firestore().collection('users').doc(uid).update(data);
      
      // If displayName changed, update Auth profile too
      if (data.displayName) {
        await auth().currentUser?.updateProfile({ displayName: data.displayName });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Updates only the card holder name
   */
  async updateCardUsername(uid: string, name: string) {
    try {
      await firestore().collection('users').doc(uid).update({
        'card.holderName': name
      });
      return true;
    } catch (error) {
      console.error('Error updating card username:', error);
      throw error;
    }
  },

  /**
   * Toggles the card frozen status
   */
  async toggleCardFreeze(uid: string, isFrozen: boolean) {
    try {
      await firestore().collection('users').doc(uid).update({
        'card.isFrozen': isFrozen
      });
      return true;
    } catch (error) {
      console.error('Error toggling card freeze:', error);
      throw error;
    }
  },

  /**
   * Sets the monthly transfer limit
   */
  async setMonthlyLimit(uid: string, limit: number) {
    try {
      await firestore().collection('users').doc(uid).update({
        'card.monthlyLimit': limit
      });
      return true;
    } catch (error) {
      console.error('Error setting monthly limit:', error);
      throw error;
    }
  },

  /**
   * Sets a budget for a specific category
   */
  async setBudget(uid: string, category: string, amount: number) {
    try {
      await firestore().collection('users').doc(uid).collection('budgets').doc(category).set({
        category,
        amount,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  },

  /**
   * Subscribes to budgets
   */
  subscribeToBudgets(uid: string, callback: (budgets: any[]) => void) {
    return firestore().collection('users').doc(uid).collection('budgets').onSnapshot((snapshot) => {
      if (snapshot && snapshot.docs) {
        callback(snapshot.docs.map(doc => doc.data()));
      }
    }, (error) => {
      console.error('Budgets subscription error:', error);
      callback([]);
    });
  },

  /**
   * Creates a transaction and updates user balance
   */
  async createTransaction(uid: string, transaction: Omit<Transaction, 'userId' | 'date'>) {
    const userRef = firestore().collection('users').doc(uid);
    
    return firestore().runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error('User does not exist');
      
      const userData = userDoc.data() as UserData;
      
      // Security Check: Is card frozen?
      if (userData.card?.isFrozen && transaction.amount < 0) {
        throw new Error('Transaction declined: Your card is currently frozen.');
      }

      const newBalance = userData.balance + transaction.amount;
      
      if (newBalance < 0 && transaction.amount < 0) {
        throw new Error('Insufficient funds');
      }
      
      // Add transaction
      const newTransactionRef = firestore().collection('transactions').doc();
      t.set(newTransactionRef, {
        ...transaction,
        userId: uid,
        date: firestore.FieldValue.serverTimestamp(),
      });
      
      // Update balance
      t.update(userRef, { balance: newBalance });
    });
  },

  /**
   * Transfers money from one user to another
   */
  async transferMoney(senderUid: string, recipientUid: string, amount: number, title: string) {
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    
    const senderRef = firestore().collection('users').doc(senderUid);
    const recipientRef = firestore().collection('users').doc(recipientUid);

    return firestore().runTransaction(async (t) => {
      const senderDoc = await t.get(senderRef);
      const recipientDoc = await t.get(recipientRef);

      if (!senderDoc.exists) throw new Error('Sender does not exist');
      if (!recipientDoc.exists) throw new Error('Recipient does not exist');

      const senderData = senderDoc.data() as UserData;
      const recipientData = recipientDoc.data() as UserData;

      if (senderData.card?.isFrozen) {
        throw new Error('Transaction declined: Your card is currently frozen.');
      }

      if (senderData.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      t.update(senderRef, { balance: senderData.balance - amount });
      t.update(recipientRef, { balance: recipientData.balance + amount });

      // Create transaction for sender (negative amount)
      const senderTxRef = firestore().collection('transactions').doc();
      t.set(senderTxRef, {
        userId: senderUid,
        title: title,
        amount: -amount,
        type: 'transfer_out',
        icon: 'swap-horizontal-outline',
        iconBg: '#F5F5F5',
        date: firestore.FieldValue.serverTimestamp(),
      });

      // Create transaction for recipient (positive amount)
      const recipientTxRef = firestore().collection('transactions').doc();
      t.set(recipientTxRef, {
        userId: recipientUid,
        title: `Received from ${senderData.displayName}`,
        amount: amount,
        type: 'transfer_in',
        icon: 'arrow-down-outline',
        iconBg: '#E8F5E9', // Light green
        date: firestore.FieldValue.serverTimestamp(),
      });
    });
  },

  /**
   * Search for a user by email
   */
  async searchUserByEmail(email: string): Promise<UserData | null> {
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('email', '==', email.toLowerCase().trim())
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return snapshot.docs[0].data() as UserData;
    } catch (error) {
      console.error('Error searching user:', error);
      return null;
    }
  },

  /**
   * Adds a beneficiary to a user's list
   */
  async addBeneficiary(uid: string, beneficiary: UserData) {
    try {
      const userRef = firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) throw new Error('User not found');
      
      const userData = userDoc.data() as UserData;
      const beneficiaries = userData.beneficiaries || [];
      
      // Check if already exists
      if (beneficiaries.some(b => b.uid === beneficiary.uid)) {
        throw new Error('Beneficiary already added');
      }

      const newBeneficiary = {
        uid: beneficiary.uid,
        displayName: beneficiary.displayName,
        email: beneficiary.email,
        cardType: beneficiary.card?.type || 'VIS',
        cardNumber: beneficiary.card?.number || '**** 0000',
      };

      await userRef.update({
        beneficiaries: firestore.FieldValue.arrayUnion(newBeneficiary)
      });
      
      return true;
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      throw error;
    }
  }
};
