import type React from "react"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Button } from "@/components/ui/button"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background">
              <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-xl font-bold">Notecraft</span>
                  </Link>
                </div>
                <nav className="flex gap-6">
                  <Link href="/document/doc-1" className="text-sm font-medium transition-colors hover:text-primary">
                    Documents
                  </Link>
                  <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                    Templates
                  </Link>
                  <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                    Settings
                  </Link>
                </nav>
                <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
              </div>
            </header>
            <main className="flex-1 bg-muted/40">{children}</main>
            <footer className="border-t bg-muted">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-bold">Notecraft</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Notecraft. All rights reserved.
          </p>
        </div>
      </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

