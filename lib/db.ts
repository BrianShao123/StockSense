import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, getDoc, orderBy, query, where, limit, startAfter, onSnapshot, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Item, Transaction } from './firestore';
import { Timestamp } from "firebase/firestore";

const itemsCollection = collection(db, 'items');
const transactionsCollection = collection(db, 'transactions');

export async function createItem(data: Omit<Item, 'id'>, uid: string): Promise<void> {
  try {
    await addDoc(itemsCollection, {
      ...data,
      uid,
      timeUpdated: new Date(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

export async function getItems(uid: string, search: string = '', offset: string | null = null, pageSize: number = 5): Promise<{
  items: Item[];
  newOffset: string | null;
  totalItems: number;
}> {
  try {
    let itemsQuery = query(itemsCollection, where('uid', '==', uid), limit(pageSize));

    if (search) {
      itemsQuery = query(
        itemsCollection,
        where('uid', '==', uid),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff'),
        limit(pageSize)
      );
    } else if (offset) {
      itemsQuery = query(
        itemsCollection,
        where('uid', '==', uid),
        startAfter(offset),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(itemsQuery);
    const items: Item[] = [];
    querySnapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() } as Item);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const newOffset = items.length === pageSize ? lastVisible.id : null;

    return {
      items,
      newOffset,
      totalItems: items.length,
    };
  } catch (error) {
    console.error("Error getting documents: ", error);
    return { items: [], newOffset: null, totalItems: 0 };
  }
}

export async function getTransactions(
  uid: string,
  search: string = '',
  offset: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 5
): Promise<{
  transactions: Transaction[];
  newOffset: QueryDocumentSnapshot<DocumentData> | null;
  totalTransactions: number;
}> {
  try {
    let transactionsQuery = query(
      transactionsCollection,
      where('uid', '==', uid),
      orderBy('time', 'desc'),
      limit(pageSize)
    );

    if (search) {
      transactionsQuery = query(
        transactionsCollection,
        where('uid', '==', uid),
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff'),
        orderBy('time', 'desc'),
        limit(pageSize)
      );
    } else if (offset) {
      transactionsQuery = query(
        transactionsCollection,
        where('uid', '==', uid),
        orderBy('time', 'desc'),
        startAfter(offset),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: Transaction[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data() as Omit<Transaction, 'time'> & { time: Timestamp };
      transactions.push({ ...data, time: data.time.toDate(), id: doc.id });
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    return {
      transactions,
      newOffset: lastVisible,
      totalTransactions: querySnapshot.size,
    };
  } catch (error) {
    console.error("Error getting documents: ", error);
    return { transactions: [], newOffset: null, totalTransactions: 0 };
  }
}

export function listenToItems(uid: string, callback: (items: Item[]) => void): () => void {

  if (typeof uid !== 'string' || uid.trim() === '') {
    console.warn('Invalid uid parameter, using empty string instead');
    uid = '';
  }

  const itemsQuery = query(itemsCollection, where('uid', '==', uid));
  const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
    const items: Item[] = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() } as Item);
    });
    callback(items);
  });
  return unsubscribe;
}

export async function updateItem(id: string, updatedFields: Partial<Item>, uid: string): Promise<void> {
  try {
    const itemRef = doc(itemsCollection, id);
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists() && itemDoc.data().uid === uid) {
      await updateDoc(itemRef, {
        ...updatedFields,
        timeUpdated: new Date(),
      });
    } else {
      console.error("Error updating document: Access denied");
    }
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

export async function getAllTransactions(uid: string): Promise<{
  transactions: Transaction[];
}> {
  try {
    const pageSize = 100;
    let transactionsQuery = query(transactionsCollection, where('uid', '==', uid), limit(pageSize));

    const allTransactions: Transaction[] = [];
    let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    let fetchMore = true;

    while (fetchMore) {
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(lastVisible ? query(transactionsQuery, startAfter(lastVisible)) : transactionsQuery);
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as Omit<Transaction, 'time'> & { time: Timestamp };
        allTransactions.push({ ...data, time: data.time.toDate(), id: doc.id });
      });

      lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      fetchMore = querySnapshot.docs.length === pageSize;
    }

    return {
      transactions: allTransactions,
    };
  } catch (error) {
    console.error("Error getting documents: ", error);
    return { transactions: [] };
  }
}

export async function deleteItemByName(name: string, uid: string): Promise<void> {
  try {
    const q = query(itemsCollection, where('name', '==', name), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const itemDoc = querySnapshot.docs[0];
      const itemData = itemDoc.data() as Item;
      const itemId = itemDoc.id;

      await deleteDoc(doc(itemsCollection, itemId));
      // console.log("Document successfully deleted", itemData);

      const transactionData: Transaction = {
        name: itemData.name,
        operation: 'dump',
        quantity: itemData.quantity,
        uid: uid,
        // price: -itemData.price * 0.1,
        price: 0,
        time: new Date(),
        status: 'completed',
      };

      await addDoc(transactionsCollection, transactionData);

    } else {
      console.error("Error deleting document: Access denied");
      throw new Error("Access denied");
    }
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
}