type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "cancel";
  };
  
  const variants = {
    primary:
      "bg-button-background text-button-text hover:cursor-pointer hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70",
    secondary:
      "text-foreground hover:cursor-pointer hover:bg-button-hover/20 disabled:opacity-70",
    cancel:
      "text-danger hover:cursor-pointer hover:bg-button-hover/20 dark:hover:bg-button-hover/30",
  };

  export function Button({
    variant = "primary",
    className = "",
    ...props
  }: ButtonProps) {
    return (
      <button
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }