import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Item } from '@/lib/firestore';
import { deleteItemByName } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/context/AuthContext';
import { Status } from '@/components/ui/status';
import { DeleteModal } from '@/components/ui/deleteModal';

function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

function formatDate(timeUpdated: any): string {
  if (timeUpdated instanceof Date) {
    return timeUpdated.toLocaleString();
  } else if (timeUpdated instanceof Timestamp) {
    return timeUpdated.toDate().toLocaleString() + " EDT";
  } else {
    return 'Invalid Date';
  }
}

export function ItemRow({ item }: { item: Item }) {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedPrice, setEditedPrice] = useState(item.price);
  const [editedCount, setEditedCount] = useState(item.quantity);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (loading || !user) {
      toast({
        title: "Error",
        description: "Please wait for authentication to complete.",
        variant: "destructive",
      });
      return;
    }

    if (
      editedName === item.name &&
      editedPrice === item.price &&
      editedCount === item.quantity
    ) {
      toast({
        title: "No Changes",
        description: "No changes were made to the item.",
      });
      setIsEditing(false);
      return;
    }

    const operation = editedCount > item.quantity ? "input" : "output";
    const difference = Math.abs(editedCount - item.quantity);

    const itemData = {
      ...item,
      name: editedName,
      price: editedPrice,
      quantity: editedCount,
      operation,
      mostRecentOperationCount: difference,
      timeUpdated: new Date(),
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/item', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`,
          'Inlineedit': 'True'
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Item updated successfully",
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    if (user) {
      try {
        await deleteItemByName(item.name, user.uid);
        toast({
          title: "Deleted",
          description: "Item deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Status quantity={item.quantity} />
        </TableCell>
        <TableCell className="font-medium">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border p-1 w-full"
            />
          ) : (
            item.name
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editedPrice}
              onChange={(e) => setEditedPrice(parseFloat(e.target.value))}
              className="border p-1 w-full"
            />
          ) : (
            item.price !== undefined ? `$${(item.price).toFixed(2)}` : 'N/A'
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <input
              type="number"
              value={editedCount}
              onChange={(e) => setEditedCount(parseInt(e.target.value))}
              className="border p-1 w-full"
            />
          ) : (
            formatCount(item.quantity)
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">{item.mostRecentOperationCount}</TableCell>
        <TableCell className="hidden md:table-cell">{formatDate(item.timeUpdated)}</TableCell>
        <TableCell className="hidden md:table-cell">${(item.price * 0.9 * item.quantity).toFixed(2)}</TableCell>
        <TableCell>
          {isEditing ? (
            <Button onClick={handleSaveClick} variant="ghost" size="icon" className="ml-2">
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={item.name}
      />
    </>
  );
}
