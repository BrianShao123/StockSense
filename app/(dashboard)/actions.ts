'use server';

import { deleteItemByName } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteItem(formData: FormData) {
  // let id = Number(formData.get('id'));
  // await deleteProductById(id);
  // revalidatePath('/');
}
