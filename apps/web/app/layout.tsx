import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Daktar Khata - Clinic Management Software for Modern Practices",
  description:
    "Daktar Khata is the all-in-one clinic management platform for doctors, clinics, and hospitals. Manage patients, appointments, prescriptions, and billing in one place.",
  keywords: [
    "clinic management",
    "doctor software",
    "patient records",
    "appointment scheduling",
    "practice management",
    "bangladesh",
  ],
  openGraph: {
    title: "Daktar Khata - Clinic Management Software for Modern Practices",
    description:
      "Manage patients, appointments, prescriptions, and billing in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daktar Khata - Clinic Management Software",
    description: "Manage patients, appointments, prescriptions, and billing in one place.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.remove('dark')}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}