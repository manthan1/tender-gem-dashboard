<<<<<<< HEAD

=======
>>>>>>> 42979bccc7aca46816c64ef5401d08fdcd1e8018
import * as React from "react"

import { cn } from "@/lib/utils"

<<<<<<< HEAD
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
=======
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
>>>>>>> 42979bccc7aca46816c64ef5401d08fdcd1e8018
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
<<<<<<< HEAD
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
=======
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
>>>>>>> 42979bccc7aca46816c64ef5401d08fdcd1e8018
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
