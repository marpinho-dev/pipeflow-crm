export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary">PipeFlow</span>
          <span className="text-2xl font-bold text-foreground">CRM</span>
        </div>
        {children}
      </div>
    </div>
  )
}
