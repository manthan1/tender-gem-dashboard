
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { DocumentType, UserDocument, useUserDocuments } from "@/hooks/useUserDocuments";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const documentTypeLabels: Record<DocumentType, string> = {
  aadhar: "Aadhar Card",
  pan: "PAN Card",
  driving_license: "Driving License"
};

const DocumentUploadCard: React.FC<{
  type: DocumentType;
  document?: UserDocument;
  onUpload: (file: File) => Promise<void>;
  onDownload: () => Promise<void>;
  onDelete: () => Promise<void>;
  isUploading: boolean;
}> = ({ type, document, onUpload, onDownload, onDelete, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
    // Clear input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {documentTypeLabels[type]}
        </CardTitle>
        <CardDescription>
          Upload your {documentTypeLabels[type]} (PDF only, max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {document ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate max-w-[200px]" title={document.file_name}>
                {document.file_name}
              </span>
              <div className="flex items-center gap-1">
                {document.verified ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Check className="h-4 w-4 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>Verified</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <X className="h-4 w-4 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>Pending verification</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded on {format(new Date(document.uploaded_at), "dd MMM yyyy")}
            </p>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">No document uploaded</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-1 h-3 w-3" />
          {document ? "Replace" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {document && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={onDownload}
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Deleting this document may affect your ability to participate in certain tenders that require this documentation.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete();
                setConfirmDelete(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const DocumentUpload: React.FC = () => {
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    downloadDocument,
    deleteDocument
  } = useUserDocuments();

  const documentTypes: DocumentType[] = ['aadhar', 'pan', 'driving_license'];

  const getDocumentByType = (type: DocumentType) => {
    return documents.find(d => d.document_type === type);
  };

  const handleUpload = async (file: File, type: DocumentType) => {
    await uploadDocument(file, type);
  };

  const handleDownload = async (documentId: string) => {
    await downloadDocument(documentId);
  };

  const handleDelete = async (documentId: string) => {
    await deleteDocument(documentId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {documentTypes.map(type => (
          <Card key={type} className="w-full">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documentTypes.map(type => {
        const doc = getDocumentByType(type);
        return (
          <DocumentUploadCard
            key={type}
            type={type}
            document={doc}
            onUpload={(file) => handleUpload(file, type)}
            onDownload={() => doc ? handleDownload(doc.id) : Promise.resolve()}
            onDelete={() => doc ? handleDelete(doc.id) : Promise.resolve()}
            isUploading={uploading === type}
          />
        );
      })}
    </div>
  );
};
