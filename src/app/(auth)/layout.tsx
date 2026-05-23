export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-3 py-8 safe-top safe-bottom sm:px-4">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          RupeeRise
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your INR savings with clarity
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
