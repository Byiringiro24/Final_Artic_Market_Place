'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Phone, MapPin, MessageCircle, X, CheckCircle2, Loader2 } from 'lucide-react';
import { post } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const schema = z.object({
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  phone: z.string().min(7, 'Phone number required'),
  address: z.string().min(5, 'Address required'),
  notes: z.string().optional(),
  type: z.enum(['standard', 'express', 'emergency']),
});
type BookingForm = z.infer<typeof schema>;

interface Props {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const BOOKING_TYPES = [
  { value: 'standard', label: 'Standard', desc: 'Within 48 hours', price: '+$0' },
  { value: 'express', label: 'Express', desc: 'Within 24 hours', price: '+$15' },
  { value: 'emergency', label: 'Emergency', desc: 'Same day', price: '+$30' },
];

// Get min date (tomorrow)
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function BookingModal({ serviceId, serviceTitle, onClose }: Props) {
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'standard' },
  });

  const selectedTime = watch('time');
  const selectedType = watch('type');

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BookingForm) =>
      post('/bookings', { serviceId, serviceTitle, ...data }),
    onSuccess: () => setDone(true),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1A2332] text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-[#18A89A] text-xs font-bold uppercase tracking-widest mb-1">Book Service</p>
            <h2 className="font-bold text-lg">{serviceTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Not authenticated */}
        {!isAuthenticated && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#18A89A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-[#18A89A]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Sign in to book</h3>
            <p className="text-gray-500 text-sm mb-5">You need an account to book this service.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="bg-[#18A89A] hover:bg-[#0F7A70] text-white rounded-full">
                <Link href={`/${locale}/sign-in`} onClick={onClose}>Sign In</Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            </div>
          </div>
        )}

        {/* Success state */}
        {isAuthenticated && done && (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-[#18A89A] mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Booking Submitted! 🎉</h3>
            <p className="text-gray-600 text-sm mb-2">
              Your booking for <strong>{serviceTitle}</strong> has been received.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Our team will contact you to confirm the appointment.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="https://wa.me/250787585826" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <Button variant="outline" onClick={onClose} className="rounded-full">Close</Button>
            </div>
          </div>
        )}

        {/* Booking form */}
        {isAuthenticated && !done && (
          <form onSubmit={handleSubmit((d) => mutate(d))} className="p-5 space-y-5">
            {/* Booking type */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Booking Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {BOOKING_TYPES.map((t) => (
                  <label key={t.value}
                    className={`relative border rounded-xl p-3 cursor-pointer transition-all text-center ${
                      selectedType === t.value ? 'border-[#18A89A] bg-[#18A89A]/5' : 'hover:border-gray-300'
                    }`}>
                    <input type="radio" value={t.value} {...register('type')} className="sr-only" />
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-[10px] text-gray-500">{t.desc}</p>
                    <span className={`text-xs font-bold ${t.value === 'standard' ? 'text-gray-500' : 'text-[#18A89A]'}`}>
                      {t.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-semibold mb-1">
                <Calendar className="h-4 w-4 text-[#18A89A]" /> Preferred Date *
              </Label>
              <Input type="date" min={getMinDate()} className="mt-1 focus:ring-[#18A89A]" {...register('date')} />
              {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
            </div>

            {/* Time slots */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Clock className="h-4 w-4 text-[#18A89A]" /> Preferred Time *
              </Label>
              <div className="grid grid-cols-5 gap-1.5">
                {TIME_SLOTS.map((slot) => (
                  <label key={slot}
                    className={`border rounded-lg py-1.5 px-2 text-center cursor-pointer text-xs font-medium transition-all ${
                      selectedTime === slot ? 'bg-[#18A89A] text-white border-[#18A89A]' : 'hover:border-[#18A89A]/50 hover:bg-[#18A89A]/5'
                    }`}>
                    <input type="radio" value={slot} {...register('time')} className="sr-only" />
                    {slot}
                  </label>
                ))}
              </div>
              {errors.time && <p className="text-destructive text-xs mt-1">{errors.time.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-semibold mb-1">
                <Phone className="h-4 w-4 text-[#18A89A]" /> Your Phone Number *
              </Label>
              <Input type="tel" className="mt-1" placeholder="0787000000" {...register('phone')} />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Address */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-semibold mb-1">
                <MapPin className="h-4 w-4 text-[#18A89A]" /> Service Address *
              </Label>
              <Input className="mt-1" placeholder="e.g., KG 11 Ave, Kigali" {...register('address')} />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-semibold mb-1 block">Additional Notes (optional)</Label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Any special requirements..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A89A] resize-none"
              />
            </div>

            {/* WhatsApp option */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 text-sm text-green-800">
                <p className="font-medium">Prefer WhatsApp?</p>
                <a href="https://wa.me/250787585826" target="_blank" rel="noopener noreferrer"
                  className="text-green-700 hover:underline text-xs">
                  Chat directly on +250787585826 →
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}
                className="flex-1 bg-[#18A89A] hover:bg-[#0F7A70] text-white rounded-full h-11 font-semibold">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                Confirm Booking
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
