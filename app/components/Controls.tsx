"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ControlsProps {
  onOffice1Change: (minutes: number) => void;
  onOffice2Change: (minutes: number) => void;
  onMapToggle?: (mapNumber: 1 | 2) => void;
  onIntersectChange: (intersect: boolean) => void;
}

const Controls = ({
  onOffice1Change,
  onOffice2Change,
  onMapToggle,
  onIntersectChange,
}: ControlsProps) => {
  const [isSynced, setIsSynced] = useState(false);
  const [office1Minutes, setOffice1Minutes] = useState(30);
  const [office2Minutes, setOffice2Minutes] = useState(30);
  const [activeMap, setActiveMap] = useState<1 | 2>(1);
  const [isIntersectActive, setIsIntersectActive] = useState(false);

  const handleOffice1Change = (value: number) => {
    setOffice1Minutes(value);
    onOffice1Change(value);
    if (isSynced) {
      setOffice2Minutes(value);
      onOffice2Change(value);
    }
  };

  const handleOffice2Change = (value: number) => {
    setOffice2Minutes(value);
    onOffice2Change(value);
    if (isSynced) {
      setOffice1Minutes(value);
      onOffice1Change(value);
    }
  };

  const handleSyncChange = (checked: boolean) => {
    setIsSynced(checked);
    if (checked) {
      setOffice2Minutes(office1Minutes);
      onOffice2Change(office1Minutes);
    }
  };

  const toggleMap = () => {
    const newMap = activeMap === 1 ? 2 : 1;
    setActiveMap(newMap);
    onMapToggle?.(newMap);
  };

  const handleIntersectClick = () => {
    const newState = !isIntersectActive;
    setIsIntersectActive(newState);
    onIntersectChange(newState);
  };

  return (
    <Card className="fixed bottom-3 right-3 w-50 bg-white shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center">
          <Label className="flex-shrink-0">Map:</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMap}
            className="w-3 ml-2"
          >
            {activeMap}
          </Button>
          <Button
            variant={isIntersectActive ? "secondary" : "outline"}
            size="sm"
            className={`ml-2 text-sm ${isIntersectActive ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            onClick={handleIntersectClick}
          >
            ∩
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sync"
            checked={isSynced}
            onCheckedChange={handleSyncChange}
          />
          <Label htmlFor="sync">Sync times</Label>
        </div>

        <div className="flex items-center">
          <Label htmlFor="office1" className="flex-shrink-0 min-w-[4.5rem]">
            Office 1:
          </Label>
          <Input
            id="office1"
            type="number"
            min={0}
            step={5}
            value={office1Minutes}
            onChange={(e) => handleOffice1Change(Number(e.target.value))}
            className="w-14"
          />
          <span className="ml-2 text-sm text-gray-600">min</span>
        </div>

        <div className="flex items-center">
          <Label htmlFor="office2" className="flex-shrink-0 min-w-[4.5rem]">
            Office 2:
          </Label>
          <Input
            id="office2"
            type="number"
            min={0}
            step={5}
            value={office2Minutes}
            onChange={(e) => handleOffice2Change(Number(e.target.value))}
            className="w-14"
          />
          <span className="ml-2 text-sm text-gray-600">min</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;