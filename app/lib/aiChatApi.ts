import { sendChatMessage } from '@/lib/api';

export type AiChatResponse = {
  reply: string;
  session_id?: string;
  // other fields from ChatMessageResponse can be added as needed
};

/**
 * Sends a free‑form message to the backend AI chat endpoint.
 * This is a thin wrapper around the existing `sendChatMessage` API
 * so the UI can import a semantic function name (`sendAiMessage`).
 */
export async function sendAiMessage(
  token: string | undefined,
  message: string,
  sessionId?: string,
): Promise<AiChatResponse> {
  // token may be undefined in demo mode – the backend will handle it gracefully
  // The existing API returns `{ reply, ... }` – we simply forward it.
  const resp = await sendChatMessage(token as string, message, sessionId);
  // Ensure the shape matches AiChatResponse
  return {
    reply: (resp as any).reply ?? '',
    session_id: (resp as any).session_id,
  };
}
