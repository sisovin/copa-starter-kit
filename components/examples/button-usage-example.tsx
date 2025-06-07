import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Save, User } from "lucide-react";
import { useState } from "react";

export function ButtonUsageExample() {
  const [isLoading, setIsLoading] = useState(false);

  // Simulates a loading action for 2 seconds
  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="User profile">
            <User />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<Download />}>Download</Button>
          <Button rightIcon={<ArrowRight />}>Next</Button>
          <Button
            variant="outline"
            leftIcon={<Save />}
            rightIcon={<ArrowRight />}
          >
            Save and continue
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
          <Button isLoading loadingText="Loading...">
            Always Loading
          </Button>
          <Button
            variant="secondary"
            isLoading={isLoading}
            onClick={handleButtonClick}
          >
            {isLoading ? "Loading..." : "Click to Load"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Full Width Button</h3>
        <Button className="w-full" size="lg">
          Full Width Button
        </Button>
      </div>
    </div>
  );
}
