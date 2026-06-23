import { useState, useCallback } from 'react'
import { AI_BASE } from '../lib/ai'
import type { TourPackage, ChatMessage } from '../types'

export function useBookingChat(
  selectedPackage: TourPackage,
  initialMessages: ChatMessage[],
  onUpdate: (msgs: ChatMessage[]) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [streaming, setStreaming] = useState(false)

  const sync = useCallback(
    (msgs: ChatMessage[]) => {
      setMessages(msgs)
      onUpdate(msgs)
    },
    [onUpdate],
  )

  const initChat = useCallback(() => {
    const priceInfo = selectedPackage.price_per_person
      ? `${selectedPackage.price_per_person.toFixed(2)} € pro Person`
      : selectedPackage.price_flat
      ? `${selectedPackage.price_flat.toFixed(2)} € pauschal`
      : 'Preis auf Anfrage'

    const greeting: ChatMessage = {
      role: 'assistant',
      content:
        `Herzlich willkommen! Ich bin Ihr KI-Buchungsassistent.\n\n` +
        `Sie haben **${selectedPackage.name}** gewählt — eine ausgezeichnete Wahl!\n` +
        `📋 Dauer: ca. ${selectedPackage.duration_minutes ?? '?'} Min. | 👥 ${selectedPackage.min_participants}–${selectedPackage.max_participants} Personen | 💰 ${priceInfo}\n\n` +
        `Wenn Sie Fragen haben oder Hilfe beim Ausfüllen brauchen, schreiben Sie mir einfach. ` +
        `Zum Beispiel: Welches Datum haben Sie sich vorgestellt?`,
    }
    sync([greeting])
  }, [selectedPackage, sync])

  const sendMessage = useCallback(
    async (content: string) => {
      const newMessages: ChatMessage[] = [...messages, { role: 'user' as const, content }]
      const withPlaceholder: ChatMessage[] = [...newMessages, { role: 'assistant' as const, content: '' }]
      sync(withPlaceholder)
      setStreaming(true)

      try {
        const res = await fetch(`${AI_BASE}/booking/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, packages: [selectedPackage] }),
        })

        if (!res.ok || !res.body) throw new Error('Verbindung fehlgeschlagen')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          for (const line of text.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') break
            try {
              const parsed = JSON.parse(raw) as { content?: string }
              if (parsed.content) {
                assistantContent += parsed.content
                sync([...newMessages, { role: 'assistant' as const, content: assistantContent }])
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        sync([
          ...newMessages,
          {
            role: 'assistant' as const,
            content:
              'Ich bin gerade nicht erreichbar — bitte füllen Sie das Formular aus. Bei Fragen stehe ich gleich wieder bereit.',
          },
        ])
      } finally {
        setStreaming(false)
      }
    },
    [messages, selectedPackage, sync],
  )

  return { messages, streaming, sendMessage, initChat }
}
