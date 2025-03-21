
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import DocumentUploader from './DocumentUploader';
import PaymentHistory from './PaymentHistory';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

const PaymentUploaderContainer = () => {
  const [month, setMonth] = useState<string>(months[new Date().getMonth()]);
  const [year, setYear] = useState<string>(currentYear.toString());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    // Force refresh of payment history
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Payment Proof</CardTitle>
          <CardDescription>Upload proof of your monthly subscription payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="payment-month">Month</Label>
              <Select
                value={month}
                onValueChange={setMonth}
              >
                <SelectTrigger id="payment-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-year">Year</Label>
              <Select
                value={year}
                onValueChange={setYear}
              >
                <SelectTrigger id="payment-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DocumentUploader
            documentType="payment_proof"
            onUploadComplete={handleUploadComplete}
            title="Payment Proof"
            description={`Upload your bank transfer receipt, screenshot or any proof of payment for ${month} ${year}`}
            month={month}
            year={year}
          />
        </CardContent>
      </Card>
      
      {/* Payment History */}
      <div key={refreshKey}>
        <PaymentHistory />
      </div>
    </div>
  );
};

export default PaymentUploaderContainer;
