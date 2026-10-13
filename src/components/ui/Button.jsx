import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow shadow-emerald-600/20 focus:ring-emerald-500",
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow shadow-emerald-600/20 focus:ring-emerald-500",
        secondary:
          "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 focus:ring-emerald-500",
        outline:
          "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400",
        ghost:
          "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
      },
      size: {
        sm: "text-xs px-3 py-1.5 gap-1.5",
        default: "text-sm px-4 py-2.5 gap-2",
        md: "text-sm px-4 py-2.5 gap-2",
        lg: "text-base px-6 py-3.5 gap-2.5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export default function Button({
  children,
  href,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const combinedClass = cn(buttonVariants({ variant, size, className }));

  if (href) {
    return (
      <Link href={href} className={combinedClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClass} {...props}>
      {children}
    </button>
  );
}

export { Button, buttonVariants };
