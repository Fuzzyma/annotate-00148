import { DictionaryProvider } from "@/components/dictionary-provider"
import { DictionaryApp } from "@/components/dictionary-app"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <DictionaryProvider>
        <DictionaryApp />
      </DictionaryProvider>
    </main>
  )
}

