import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-0 focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 resize-y ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
