
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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Switch
            id="keyword-filter"
            checked={enabled}
            onCheckedChange={onChange}
            disabled={!hasKeywords}
            className="data-[state=checked]:bg-orange-500 focus-brand"
          />
          <Label htmlFor="keyword-filter" className="text-sm font-medium brand-navy cursor-pointer">
            <span className="block sm:inline">Filter by Keywords</span>
            {hasKeywords && keywordCount > 0 && (
              <span className="text-brand-gray-500 ml-0 sm:ml-2 font-normal block sm:inline">
                ({keywordCount} keywords)
              </span>
            )}
          </Label>
        </div>
      </div>

      {hasKeywords === false && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <AlertDescription className="text-orange-800">
            No keywords set. Add keywords to enable automatic filtering of tenders.
          </AlertDescription>
        </Alert>
      )}

      {enabled && hasKeywords && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800">
            Showing only tenders that match your saved keywords.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default KeywordFilterToggle;
