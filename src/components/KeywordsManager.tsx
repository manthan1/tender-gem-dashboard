
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useUserKeywords } from "@/hooks/useUserKeywords";

interface KeywordsManagerProps {
  onKeywordsUpdate?: () => void;
}

const KeywordsManager: React.FC<KeywordsManagerProps> = ({ onKeywordsUpdate }) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const { getUserKeywords, updateUserKeywords, loading } = useUserKeywords();

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    const userKeywords = await getUserKeywords();
    setKeywords(userKeywords);
  };

  const handleAddKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleSaveKeywords = async () => {
    const success = await updateUserKeywords(keywords);
    if (success && onKeywordsUpdate) {
      onKeywordsUpdate();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <CardDescription className="text-brand-gray-500 mb-4">
          Add keywords to automatically filter tenders based on category and bid number. 
          Only tenders matching your keywords will be shown.
        </CardDescription>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="keyword-input" className="text-sm font-medium brand-navy">Add Keyword</Label>
        <div className="flex gap-2">
          <Input
            id="keyword-input"
            placeholder="Enter a keyword (e.g., 'software', 'construction')"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-11 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-inner"
          />
          <Button 
            onClick={handleAddKeyword} 
            size="icon"
            disabled={!newKeyword.trim() || keywords.includes(newKeyword.trim())}
            className="h-10 w-10 bg-orange-500 hover:bg-orange-600 rounded-xl focus-brand"
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium brand-navy">Your Keywords</Label>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                {keyword}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button 
        onClick={handleSaveKeywords} 
        disabled={loading}
        className="w-full bg-navy-500 hover:bg-navy-600 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md focus-brand"
      >
        {loading ? "Saving..." : "Save Keywords"}
      </Button>
    </div>
  );
};

export default KeywordsManager;
