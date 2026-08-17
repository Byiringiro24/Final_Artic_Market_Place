'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MapPin, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { get, post, put, del } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Address {
  id: string; fullName: string; phone: string; street: string;
  city: string; province: string; postalCode: string; country: string;
  isDefault: boolean; label?: string;
}

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  street: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  label: z.string().optional(),
  isDefault: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function AddressesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.addresses,
    queryFn: () => get<Address[]>('/users/addresses'),
  });

  const addresses = (data?.data as unknown as Address[]) || [];

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isDefault: false },
  });

  const { mutate: saveAddress } = useMutation({
    mutationFn: (d: FormData) =>
      editing ? put(`/users/addresses/${editing.id}`, d) : post('/users/addresses', d),
    onSuccess: () => {
      toast({ title: editing ? 'Address updated' : 'Address added' });
      qc.invalidateQueries({ queryKey: queryKeys.users.addresses });
      setShowForm(false); setEditing(null); reset();
    },
    onError: () => toast({ title: 'Failed to save address', variant: 'destructive' }),
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: (id: string) => del(`/users/addresses/${id}`),
    onSuccess: () => { toast({ title: 'Address removed' }); qc.invalidateQueries({ queryKey: queryKeys.users.addresses }); },
  });

  const { mutate: setDefault } = useMutation({
    mutationFn: (id: string) => put(`/users/addresses/${id}`, { isDefault: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.addresses }),
  });

  function openEdit(addr: Address) {
    setEditing(addr);
    Object.entries(addr).forEach(([k, v]) => setValue(k as keyof FormData, v as never));
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    reset({ isDefault: false });
    setShowForm(true);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Addresses</h1>
        <Button
          onClick={openNew}
          className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full gap-2"
        >
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit((d) => saveAddress(d))} className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" {...register('fullName')} />
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" {...register('phone')} />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Street address</Label>
              <Input className="mt-1" {...register('street')} />
              {errors.street && <p className="text-destructive text-xs mt-1">{errors.street.message}</p>}
            </div>
            <div>
              <Label>City</Label>
              <Input className="mt-1" {...register('city')} />
            </div>
            <div>
              <Label>State / Province</Label>
              <Input className="mt-1" {...register('province')} />
            </div>
            <div>
              <Label>Postal code</Label>
              <Input className="mt-1" {...register('postalCode')} />
            </div>
            <div>
              <Label>Country</Label>
              <Input className="mt-1" {...register('country')} placeholder="US" />
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input className="mt-1" {...register('label')} placeholder="Home, Work, Other" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isDefault" {...register('isDefault')} />
              <label htmlFor="isDefault" className="text-sm cursor-pointer">Set as default address</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-artic-teal text-black rounded-full">
                {isSubmitting ? 'Saving…' : 'Save Address'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="skeleton h-36 rounded-lg" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border rounded-lg p-4 relative ${addr.isDefault ? 'border-artic-teal' : ''}`}
            >
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-xs bg-artic-teal text-black px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-black" /> Default
                </span>
              )}
              {addr.label && (
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{addr.label}</p>
              )}
              <p className="font-medium">{addr.fullName}</p>
              <p className="text-sm text-gray-600">{addr.street}</p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.province} {addr.postalCode}</p>
              <p className="text-sm text-gray-600">{addr.country}</p>
              <p className="text-sm text-gray-500">{addr.phone}</p>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t text-sm">
                <button onClick={() => openEdit(addr)} className="text-artic-link hover:underline flex items-center gap-1">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                {!addr.isDefault && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => deleteAddress(addr.id)} className="text-red-500 hover:underline flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setDefault(addr.id)} className="text-artic-link hover:underline">
                      Set as default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
