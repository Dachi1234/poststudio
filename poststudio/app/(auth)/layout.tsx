export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#111111] flex items-center justify-center p-4">
      {children}
    </div>
  )
}
