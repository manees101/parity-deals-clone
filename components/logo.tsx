import { Globe2Icon } from "lucide-react";
import React from "react";

const Logo = () => {
  return (
    <span className="flex items-center gap-2 font-semibold flex-shrink-0 mr-auto text-lg">
      <Globe2Icon className="size-8" />
      <span>ParityX</span>
    </span>
  );
};

export default Logo;
