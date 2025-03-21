
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('document_type', 'payment_proof')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewPaymentProof = async (filePath: string) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your subscription payment history</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No payment records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div 
                key={payment.id}
                className="border rounded-md p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">{payment.metadata?.month} {payment.metadata?.year}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {new Date(payment.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={cn(
                      payment.approved === true
                        ? "bg-green-100 text-green-600 hover:bg-green-100"
                        : payment.approved === false
                        ? "bg-red-100 text-red-600 hover:bg-red-100"
                        : "bg-orange-100 text-orange-600 hover:bg-orange-100"
                    )}
                  >
                    {payment.approved === true ? 'Verified' : 
                     payment.approved === false ? 'Rejected' : 'Pending'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => viewPaymentProof(payment.file_path)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
