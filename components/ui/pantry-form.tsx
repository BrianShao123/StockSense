import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card } from './card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/components/context/AuthContext';

const FormSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters long." }).transform((val) => val.toLowerCase()),
  operation: z.enum(["input", "output"], { message: "Operation must be either 'input' or 'output'." }),
  quantity: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseInt(val, 10) : val).refine(val => !isNaN(val), { message: "Count must be a number." }).refine(val => val > 0, { message: "Count must be greater than 0." }),
  price: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).refine(val => !isNaN(val), { message: "Price must be a number." }),
});

type FormData = z.infer<typeof FormSchema>;

export function InputForm() {
  const { user, loading } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [identifiedName, setIdentifiedName] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      operation: "input",
      quantity: 1,
      price: 1.00,
    },
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setIdentifiedName(null);
    }
  };

  const classifyImage = async () => {
    if (!image) return;
    setIsIdentifying(true);
    
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setIdentifiedName(data.label);
        form.setValue('name', data.label);
        toast({
          title: "Success!",
          description: `Image identified as ${data.label}`,
        });
      } else {
        throw new Error('Image classification failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to classify image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (loading || !user) {
      toast({
        title: "Error",
        description: "Please wait for authentication to complete.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const itemData = {
      ...data,
      timeUpdated: new Date(),
      count: data.quantity,
      price: data.price,
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/item', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`,
          'Inlineedit': 'False'
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Item added successfully",
        });
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="watermelon..." {...field}/>
                  </FormControl>
                  <FormDescription>
                    The most used name for this item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2">
              <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Image Identification</label>
              <input type="file" id="imageUpload" accept="image/*" onChange={onImageChange} className="mt-1" />
              <Button type="button" onClick={classifyImage} disabled={!image || isIdentifying} className="mt-2">
                {isIdentifying ? 'Identifying...' : 'Identify Image'}
              </Button>
            </div>
          </div>
          <FormField
            control={form.control}
            name="operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation</FormLabel>
                <FormControl>
                  <select {...field} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="input">Input (+)</option>
                    <option value="output">Output (-)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
