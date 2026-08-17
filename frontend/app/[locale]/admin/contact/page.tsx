'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Loader2, Phone, Mail, MapPin, Clock, Share2, MessageCircle } from 'lucide-react';
import { get, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactItem { key: string; value: string; label?: string; group: string }
type ContactMap = Record<string, ContactItem>;

const CONTACT_FIELDS = [
  { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'articltd1@gmail.com', group: 'contact' },
  { key: 'phone1', label: 'Phone 1', icon: Phone, placeholder: '0787585826', group: 'contact' },
  { key: 'phone2', label: 'Phone 2', icon: Phone, placeholder: '0785424098', group: 'contact' },
  { key: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, placeholder: '0787585826', group: 'contact' },
  { key: 'address', label: 'Physical Address', icon: MapPin, placeholder: 'Kigali, Rwanda', group: 'contact' },
  { key: 'support_hours', label: 'Support Hours', icon: Clock, placeholder: 'Mon–Fri: 8AM–6PM', group: 'contact' },
];

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage', group: 'social' },
  { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://twitter.com/yourhandle', group: 'social' },
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourhandle', group: 'social' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/your-company', group: 'social' },
  { key: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/@yourchannel', group: 'social' },
  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourhandle', group: 'social' },
];

export default function AdminContactPage() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contact'],
    queryFn: () => get<ContactMap>('/contact'),
    select: (r) => r.data,
  });

  const contact = data as unknown as ContactMap;

  useEffect(() => {
    if (contact) {
      const mapped: Record<string, string> = {};
      Object.entries(contact).forEach(([k, v]) => {
        mapped[k] = typeof v === 'object' ? (v as ContactItem).value : String(v);
      });
      setValues(mapped);
    }
  }, [contact]);

  const { mutate: saveAll, isPending } = useMutation({
    mutationFn: () => {
      const allFields = [...CONTACT_FIELDS, ...SOCIAL_FIELDS];
      const updates = allFields.map((f) => ({
        key: f.key, value: values[f.key] || '', label: f.label, group: f.group,
      }));
      return put('/contact', updates);
    },
    onSuccess: () => toast({ title: '✅ Contact info saved successfully' }),
    onError: () => toast({ title: 'Failed to save', variant: 'destructive' }),
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact & Social Media Settings</h1>
      <p className="text-gray-500 text-sm">These details appear on your Customer Service page and throughout the site.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-artic-teal" /> Contact Information
          </h2>
          {CONTACT_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <Label className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-gray-400" /> {label}
              </Label>
              <Input
                className="mt-1"
                value={values[key] || ''}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Social media */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-artic-teal" /> Social Media Links
          </h2>
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <Label className="capitalize">{label}</Label>
              <Input
                className="mt-1"
                value={values[key] || ''}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-artic-light border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-3 text-gray-600">Preview — Customer Service Page</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {values.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-artic-teal" /> {values.email}</span>}
          {values.phone1 && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-artic-teal" /> {values.phone1}</span>}
          {values.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> {values.whatsapp}</span>}
          {values.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-artic-teal" /> {values.address}</span>}
        </div>
      </div>

      <Button onClick={() => saveAll()} disabled={isPending} className="bg-artic-teal hover:bg-artic-teal-dark text-white rounded-lg gap-2 px-8">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save All Changes
      </Button>
    </div>
  );
}
