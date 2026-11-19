'use client';

import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { useEffect, useState } from 'react';

export interface InvoiceDetailData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  created_at: string;
  due_date: string;
  total: string;
}

interface InvoiceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetailData | null;
  onSave?: (data: InvoiceDetailData) => void;
}

export function InvoiceDetailModal({
  open,
  onOpenChange,
  invoice,
  onSave,
}: InvoiceDetailModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [total, setTotal] = useState('');

  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customerName ?? '');
      setCustomerEmail(invoice.customerEmail ?? '');
      setStatus(invoice.status ?? 'pending');
      setDueDate(invoice.due_date ?? '');
      setTotal(invoice.total ?? '');
    }
  }, [invoice]);

  const handleSave = () => {
    if (!invoice) return;
    onSave?.({
      ...invoice,
      customerName,
      customerEmail,
      status,
      due_date: dueDate,
      total,
    });
    onOpenChange(false);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View / Edit Invoice</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Invoice #</Label>
            <Input value={invoice.invoiceNumber} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label>Customer name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </div>

          <div className="grid gap-2">
            <Label>Customer email</Label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Date (created)</Label>
            <Input
              value={
                invoice.created_at
                  ? new Date(invoice.created_at).toLocaleDateString()
                  : '—'
              }
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate === '—' ? '' : dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Total ($)</Label>
            <Input
              type="text"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
