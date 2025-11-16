import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"

export const metadata = {
  title: "Agriprofit - Farm Input Expense Tracker",
  description: "Track and manage your farm input expenses efficiently",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

