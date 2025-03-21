
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentUploaderProps {
  documentType: string;
  onUploadComplete: () => void;
  title: string;
  description: string;
  month?: string; // Optional month for payment proofs
  year?: string; // Optional year for payment proofs
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documentType,
  onUploadComplete,
  title,
  description,
  month,
  year
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should not exceed 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type (PDF only)
      if (!selectedFile.type.includes('pdf') && 
          !selectedFile.type.includes('image/jpeg') && 
          !selectedFile.type.includes('image/png')) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPEG, and PNG files are accepted",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${documentType}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('student_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      // Create document record in the database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_type: file.type,
          file_path: filePath,
          document_type: documentType,
          // Add metadata for payment proofs
          metadata: documentType === 'payment_proof' ? { month, year } : null
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });
      
      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          
          {!file ? (
            <div>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, JPEG, or PNG files up to 5MB
                </p>
                <Button variant="outline" asChild>
                  <Label htmlFor={`file-upload-${documentType}`} className="cursor-pointer">
                    <Input 
                      id={`file-upload-${documentType}`} 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange} 
                    />
                    Browse Files
                  </Label>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex">
                  <FileText className="h-10 w-10 text-primary mr-3" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{file.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {uploading && (
                <div className="mt-4">
                  <div className="bg-secondary w-full h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-secondary/10 flex justify-between">
        <Button
          variant="default"
          disabled={!file || uploading}
          onClick={handleUpload}
          className="ml-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;
