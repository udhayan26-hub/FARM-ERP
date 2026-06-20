export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 dark:from-stone-950 dark:via-green-950/20 dark:to-stone-950">
      {children}
    </div>
  );
}
