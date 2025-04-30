
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GemBidApiResponse = {
  response: {
    response: {
      docs: Array<{
        b_id: string[];
        b_bid_number: string[];
        b_category_name: string[];
        b_total_quantity: number[];
        final_start_date_sort: string[];
        final_end_date_sort: string[];
        ba_official_details_minName: string[];
        ba_official_details_deptName: string[];
      }>;
    };
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with the service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get existing bid_ids from the database
    const { data: existingBids, error: queryError } = await supabase
      .from("tenders_gem")
      .select("bid_id");
    
    if (queryError) {
      throw new Error(`Error fetching existing bids: ${queryError.message}`);
    }
    
    const existingIds = new Set(existingBids?.map(b => b.bid_id) || []);
    console.log(`Found ${existingIds.size} existing bids in the database`);
    
    // Fetch new bids from external API
    const newBids = await fetchNewGemBids(existingIds);
    console.log(`Found ${newBids.length} new bids to insert`);
    
    // Insert new bids into the database with conflict handling
    if (newBids.length > 0) {
      // Use upsert with onConflict parameter to handle duplicates
      const { error: insertError } = await supabase
        .from("tenders_gem")
        .upsert(newBids, { 
          onConflict: 'bid_id', 
          ignoreDuplicates: true 
        });
      
      if (insertError) {
        throw new Error(`Error inserting new bids: ${insertError.message}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `Successfully inserted ${newBids.length} new bids` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "No new bids to insert" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in fetch-gem-bids function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to generate download URL based on bid number
function generateDownloadUrl(bidNumber: string, bidId: string): string {
  if (bidNumber.includes("/R/")) {
    return `https://bidplus.gem.gov.in/showradocumentPdf/${bidId}`;
  } else {
    return `https://bidplus.gem.gov.in/showbidDocument/${bidId}`;
  }
}

// Function to fetch new bids from the GEM API
async function fetchNewGemBids(existingIds: Set<number>, maxPages = 5) {
  const url = "https://bidplus.gem.gov.in/all-bids-data";
  // These would typically be provided as environment variables
  const csrfToken = Deno.env.get("GEM_CSRF_TOKEN") || "";
  const ciSession = Deno.env.get("GEM_CI_SESSION") || "";
  
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

// Extract bid data from API response
function extractBidData(apiResponse: GemBidApiResponse) {
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
      download_url: bidId && bidNumber ? generateDownloadUrl(bidNumber, bidId) : null
    };
  });
}
