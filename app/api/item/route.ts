import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { Item, Transaction } from '@/lib/firestore';

const itemsCollection = adminDb.collection('items');
const transactionsCollection = adminDb.collection('transactions');

export async function PUT(req: NextRequest) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
  }

  try {
    const data: Item = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Unauthorized - No Cookie Found' }, { status: 401 });
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [key, value] = cookie.split('=');
        return [key, value];
      }).filter(pair => pair.length === 2)
    );

    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No Token Found' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUid = decodedToken.uid;

    if (!userUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const querySnapshot = await itemsCollection
      .where('name', '==', data.name)
      .where('uid', '==', userUid)
      .get();

    let existingItemId: string | null = null;
    let existingItemData: Item | null = null;

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      existingItemId = docSnapshot.id;
      existingItemData = docSnapshot.data() as Item;
    }

    const editHeader = req.headers.get('Inlineedit');

    if (existingItemId && existingItemData) {
      const itemDocRef = itemsCollection.doc(existingItemId);
      if (editHeader === 'True') {
        const quantityDifference = data.quantity - existingItemData.quantity;
        await itemDocRef.update({
          ...data,
          uid: userUid,
          timeUpdated: new Date(),
        });

        const transactionData: Transaction = {
          name: data.name,
          operation: quantityDifference > 0 ? 'input' : 'output',
          quantity: Math.abs(quantityDifference),
          uid: userUid,
          price: data.price,
          time: new Date(),
          status: 'completed',
        };
        await transactionsCollection.add(transactionData);
      } else {
        let newCount = existingItemData.quantity;

        if (data.operation === 'input') {
          newCount += data.quantity;
          data.mostRecentOperationCount = data.quantity;
        } else if (data.operation === 'output') {
          if (data.quantity > newCount) {
            return NextResponse.json({ error: 'Stock quantity cannot go negative' }, { status: 400 });
          }
          newCount -= data.quantity;
          data.mostRecentOperationCount = data.quantity;
        }

        await itemDocRef.update({
          ...data,
          uid: userUid,
          quantity: newCount,
          timeUpdated: new Date(),
        });

        const transactionData: Transaction = {
          name: data.name,
          operation: data.operation,
          quantity: data.mostRecentOperationCount,
          uid: userUid,
          price: data.price,
          time: new Date(),
          status: 'completed',
        };
        await transactionsCollection.add(transactionData);
      }
    } else {
      await itemsCollection.add({
        ...data,
        uid: userUid,
        timeUpdated: new Date(),
      });

      const transactionData: Transaction = {
        name: data.name,
        operation: data.operation,
        quantity: data.quantity,
        uid: userUid,
        price: data.price,
        time: new Date(),
        status: 'completed',
      };
      await transactionsCollection.add(transactionData);
    }

    return NextResponse.json({ message: 'Item and transaction updated successfully' }, { status: 200 });
  } catch (error) {
    console.error("Detailed error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update item and transaction', details: errorMessage }, { status: 500 });
  }
}
