
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { GemBid } from "@/hooks/useGemBids";
import { UserBid } from "@/hooks/useUserBids";

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: GemBid | null;
  existingBid: UserBid | null;
  onPlaceBid: (tenderId: number, bidAmount: number, notes?: string) => Promise<{ success: boolean, error?: string }>;
}

const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ isOpen, onClose, tender, existingBid, onPlaceBid }) => {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Set the initial values when the modal opens or when existingBid changes
  useEffect(() => {
    if (existingBid) {
      setBidAmount(existingBid.bid_amount.toString());
      setNotes(existingBid.notes || "");
    } else {
      setBidAmount("");
      setNotes("");
    }
  }, [existingBid, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!tender) return;
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await onPlaceBid(tender.id, amount, notes);
      if (result.success) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setBidAmount("");
    setNotes("");
    onClose();
  };

  if (!tender) return null;

  // Determine the modal title based on whether we're editing or creating
  const modalTitle = existingBid ? "Update Bid" : "Place Bid";
  const submitButtonText = existingBid ? "Update Bid" : "Place Bid";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {existingBid 
              ? `Update your bid details for ${tender.bid_number}` 
              : `Enter your bid details for ${tender.bid_number}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tender-info" className="text-right">
                Tender
              </Label>
              <div id="tender-info" className="col-span-3 text-sm">
                <p><strong>Bid Number:</strong> {tender.bid_number}</p>
                <p><strong>Category:</strong> {tender.category}</p>
                <p><strong>Ministry:</strong> {tender.ministry}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bidAmount" className="text-right">
                Bid Amount
              </Label>
              <Input
                id="bidAmount"
                type="number"
                step="0.01"
                min="0"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="col-span-3"
                placeholder="Enter bid amount"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Add any notes or comments about your bid"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceBidModal;
