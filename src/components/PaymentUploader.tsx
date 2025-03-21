
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DocumentUploader from './DocumentUploader';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PaymentUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    MONTHS[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    // Generate years (current year and next year)
    const currentYear = new Date().getFullYear();
    setYears([currentYear.toString(), (currentYear + 1).toString()]);
    
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_type', 'payment_proof');
        
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Could not load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student_documents')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds
        
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "Error viewing document",
        description: "There was an error opening the document",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = () => {
    fetchPayments();
  };

  const getPaymentStatus = (payment: any) => {
    if (payment.approved) {
      return {
        label: "Verified",
        variant: "outline" as const,
        className: "bg-green-50 text-green-700 hover:bg-green-50 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    }
    return {
      label: "Pending",
      variant: "outline" as const,
      className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200",
      icon: <Clock className="h-3 w-3 mr-1" />
    };
  };

  const isPaymentExistingForMonthYear = (month: string, year: string) => {
    return payments.some(payment => {
      const metadata = payment.metadata as any;
      return metadata && metadata.month === month && metadata.year === year;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Subscription Payments</CardTitle>
        <CardDescription>
          Upload proof of payment for your monthly subscription
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="space-y-2 md:w-1/2">
            <h3 className="text-sm font-medium">Upload New Payment Proof</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isPaymentExistingForMonthYear(selectedMonth, selectedYear) ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-800">
                    You already submitted a payment proof for {selectedMonth} {selectedYear}.
                  </p>
                </div>
              </div>
            ) : (
              <DocumentUploader
                documentType="payment_proof"
                onUploadComplete={handleUploadComplete}
                title="Payment Proof"
                description={`Upload proof of payment for ${selectedMonth} ${selectedYear}`}
                month={selectedMonth}
                year={selectedYear}
              />
            )}
          </div>
          
          <div className="space-y-2 md:w-1/2">
            <h3 className="text-sm font-medium">Payment History</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading payment history...</p>
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment records found.</p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const metadata = payment.metadata as any || {};
                      const status = getPaymentStatus(payment);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {metadata.month} {metadata.year}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={status.variant}
                              className={status.className}
                            >
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDocument(payment.file_path)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentUploader;
