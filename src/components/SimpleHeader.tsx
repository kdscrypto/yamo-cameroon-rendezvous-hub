import * as React from "react";

const SimpleHeader = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Simple Logo without Link */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/20">
              <span className="text-white font-bold text-lg drop-shadow-lg">Y</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Yamo
            </span>
          </div>
          
          {/* Simple text instead of buttons */}
          <div className="text-muted-foreground">
            Application loading...
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;