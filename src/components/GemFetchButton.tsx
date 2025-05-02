
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type definitions for the GEM API response
interface GemBidApiResponse {
  response?: {
    response?: {
      docs?: any[];
    };
  };
}

// Extract bid data from API response
const extractBidData = (apiResponse: GemBidApiResponse) => {
  const docs = apiResponse?.response?.response?.docs || [];

  return docs.map(bid => {
    const bidId = bid.b_id?.[0];
    const bidNumber = bid.b_bid_number?.[0] || "";

    return {
      bid_id: bidId,
      bid_number: bidNumber,
      category: bid.b_category_name?.[0] || null,
      quantity: bid.b_total_quantity?.[0] || null,
      start_date: bid.final_start_date_sort?.[0] || null,
      end_date: bid.final_end_date_sort?.[0] || null,
      ministry: bid.ba_official_details_minName?.[0] || null,
      department: bid.ba_official_details_deptName?.[0] || null,
      bid_url: bidNumber ? `https://bidplus.gem.gov.in/bidlists?bid_no=${bidNumber}` : null,
      download_url: bidId && bidNumber ? `https://bidplus.gem.gov.in/showbidDocument/${bidNumber}/${bidId}` : null
    };
  });
};

// Function to fetch new bids from the GEM API
async function fetchNewGemBids(existingIds: Set<number>, maxPages = 5) {
  const url = "https://bidplus.gem.gov.in/all-bids-data";
  
  // Using hardcoded placeholder values instead of prompting the user
  // These should be replaced with actual values in production
  const csrfToken = "placeholder-csrf-token";
  const ciSession = "placeholder-ci-session";
  
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://bidplus.gem.gov.in",
    "Referer": "https://bidplus.gem.gov.in/all-bids",
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest"
  };
  
  const cookies = {
    "csrf_gem_cookie": csrfToken,
    "ci_session": ciSession
  };
  
  const allBids = [];
  
  // Fetch data for each page
  for (let page = 1; page <= maxPages; page++) {
    console.log(`Checking page ${page}...`);
    
    const payload = {
      "payload": JSON.stringify({
        "page": page,
        "param": {"searchBid": "", "searchType": "fullText"},
        "filter": {"bidStatusType": "ongoing_bids", "byType": "all", "sort": "Bid-Start-Date-Latest"}
      }),
      "csrf_bd_gem_nk": csrfToken
    };
    
    // Form encode the payload
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, value as string);
    }
    
    // Set up cookie header
    const cookieHeader = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Cookie": cookieHeader
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        console.error(`Page ${page} error: ${response.status}`);
        break;
      }
      
      const data = await response.json() as GemBidApiResponse;
      const bids = extractBidData(data);
      
      // Filter out bids that already exist in the database
      const newBids = bids.filter(b => !existingIds.has(b.bid_id));
      allBids.push(...newBids);
      
      // Sleep to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }
  
  return allBids;
}

interface GemFetchButtonProps {
  className?: string;
}

export const GemFetchButton: React.FC<GemFetchButtonProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchBids = async () => {
    setIsLoading(true);
    try {
      // Get existing bid IDs from the database
      const { data: existingBids } = await supabase
        .from("tenders_gem")
        .select("bid_id");
      
      const existingIds = new Set((existingBids || []).map(bid => bid.bid_id));
      
      // Fetch new bids from the GEM API
      const newBids = await fetchNewGemBids(existingIds, 2); // Limiting to 2 pages for testing
      
      if (newBids.length > 0) {
        // Insert new bids into the database
        const { data, error } = await supabase
          .from("tenders_gem")
          .insert(newBids);
        
        if (error) {
          console.error("Error saving bids:", error);
          throw new Error(error.message);
        }
        
        toast({
          title: "Success",
          description: `Fetched ${newBids.length} new bids from GEM portal.`,
        });
      } else {
        toast({
          title: "Information",
          description: "No new bids found.",
        });
      }
    } catch (error: any) {
      console.error("Error in fetch process:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch bids from GEM portal.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleFetchBids}
      disabled={isLoading}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Fetching..." : "Fetch GEM Bids"}
    </Button>
  );
};

export default GemFetchButton;
