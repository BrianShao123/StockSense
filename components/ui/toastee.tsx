"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function TestToast() {
  const triggerToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test toast message.",
    });
  };

  return (
    <Button onClick={triggerToast}>
      Show Test Toast
    </Button>
  );
}

export default TestToast;
