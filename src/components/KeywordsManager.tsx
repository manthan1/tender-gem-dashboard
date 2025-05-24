
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
    <Card>
      <CardHeader>
        <CardTitle>Keyword Filters</CardTitle>
        <CardDescription>
          Add keywords to automatically filter tenders based on category and bid number. 
          Only tenders matching your keywords will be shown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword-input">Add Keyword</Label>
          <div className="flex gap-2">
            <Input
              id="keyword-input"
              placeholder="Enter a keyword (e.g., 'software', 'construction')"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              onClick={handleAddKeyword} 
              size="sm"
              disabled={!newKeyword.trim() || keywords.includes(newKeyword.trim())}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="space-y-2">
            <Label>Your Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
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
          className="w-full"
        >
          {loading ? "Saving..." : "Save Keywords"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KeywordsManager;
