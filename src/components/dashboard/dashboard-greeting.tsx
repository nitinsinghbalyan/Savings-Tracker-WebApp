type DashboardGreetingProps = {
  name: string;
};

function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  const salutation = greetingForHour(new Date().getHours());

  return (
    <div>
      <p className="text-sm text-muted-foreground">{salutation}</p>
      <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
    </div>
  );
}
