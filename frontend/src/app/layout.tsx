import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Central de Eventos',
  description: 'Gestão Premium de Eventos e Pagamentos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={outfit.className}>
        <AuthProvider>
          <main className="container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
