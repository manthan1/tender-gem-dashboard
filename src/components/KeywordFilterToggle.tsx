
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface KeywordFilterToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  hasKeywords: boolean | null;
  keywordCount?: number;
}

const KeywordFilterToggle: React.FC<KeywordFilterToggleProps> = ({
  enabled,
  onChange,
  hasKeywords,
  keywordCount = 0
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Switch
          id="keyword-filter"
          checked={enabled}
          onCheckedChange={onChange}
          disabled={!hasKeywords}
        />
        <Label htmlFor="keyword-filter" className="text-sm font-medium">
          Filter by Keywords
          {hasKeywords && keywordCount > 0 && (
            <span className="text-muted-foreground ml-1">
              ({keywordCount} keywords)
            </span>
          )}
        </Label>
      </div>

      {hasKeywords === false && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No keywords set. Add keywords to enable automatic filtering of tenders.
          </AlertDescription>
        </Alert>
      )}

      {enabled && hasKeywords && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Showing only tenders that match your saved keywords.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default KeywordFilterToggle;
