/*
 * Wasender TypeScript SDK - Webhook Utilities
 * Provides helpers for verifying and typing incoming webhook events from Wasender.
 * Version: 0.1.0
 */

/**
 * The HTTP header name used by Wasender to send the webhook signature.
 */
export const WEBHOOK_SIGNATURE_HEADER = "x-webhook-signature";

/**
 * Verifies the webhook signature from Wasender.
 *
 * @remarks
 * IMPORTANT: The current Wasender documentation example shows a direct string comparison
 * for the signature and secret (`signature === webhookSecret`). This is a very simple
 * verification method. Most webhook systems use HMAC-SHA256 or similar cryptographic hashes
 * for security.
 *
 * **Please VERIFY with Wasender's official documentation or support if this simple string
 * comparison is indeed the correct and only method for signature verification.**
 * If they use HMAC, this function will need to be updated to use Node.js `crypto` module
 * or a similar library (like Web Crypto API for browser/worker environments) to compute
 * and compare HMAC hashes. This function currently implements the simple check as per
 * the provided example.
 *
 * @param requestSignature - The signature string from the `X-Webhook-Signature` header of the incoming request.
 * @param configuredSecret - Your webhook secret configured in the Wasender dashboard.
 * @returns `true` if the signature is valid according to the simple check, `false` otherwise.
 */
export function verifyWasenderWebhookSignature(
  requestSignature: string | undefined | null,
  configuredSecret: string
): boolean {
  if (!requestSignature || !configuredSecret) {
    return false;
  }
  // IMPORTANT: This is a simple check based on initial documentation.

  return requestSignature === configuredSecret;
}

/**
 * Known webhook event types from Wasender.
 */
export const WasenderWebhookEventType = {
  // Chat Events
  ChatsUpsert: "chats.upsert",
  ChatsUpdate: "chats.update",
  ChatsDelete: "chats.delete",
  // Group Events
  GroupsUpsert: "groups.upsert",
  GroupsUpdate: "groups.update",
  GroupParticipantsUpdate: "group-participants.update",
  // Contact Events
  ContactsUpsert: "contacts.upsert",
  ContactsUpdate: "contacts.update",
  // Message Events
  MessagesUpsert: "messages.upsert", // New incoming message
  MessagesUpdate: "messages.update", // Message status update (e.g., delivered, read by recipient)
  MessagesDelete: "messages.delete",
  MessagesReaction: "messages.reaction",
  // New events from server
  CallReceived: "call.received",
  MessagesPersonalReceived: "messages-personal.received",
  MessagesNewsletterReceived: "messages-newsletter.received",
  MessagesGroupReceived: "messages-group.received",
  MessagesReceived: "messages.received",
  PollResults: "poll.results",
  // Message Receipt (specific to a user in a group or a direct chat)
  MessageReceiptUpdate: "message-receipt.update",
  // Session Events
  MessageSent: "message.sent", // Message successfully sent *from your session*
  SessionStatus: "session.status",
  QrCodeUpdated: "qrcode.updated",
} as const;

export type WasenderWebhookEventType =
  (typeof WasenderWebhookEventType)[keyof typeof WasenderWebhookEventType];

/**
 * Base interface for all Wasender webhook events.
 */
export interface BaseWebhookEvent<T extends WasenderWebhookEventType, D = any> {
  /** The type of the event. */
  event: T;
  /** Timestamp of the event generation (example, confirm actual structure). */
  timestamp?: number; // Unix timestamp
  /** The actual data payload for the event. Can be a single object or an array of objects. */
  data: D | D[];
  /** Session ID or identifier associated with the event (example). */
  sessionId?: string;
}

// ---------- Message Key (Commonly used) ----------
export interface MessageKey {
  id: string;
  fromMe: boolean;
  remoteJid: string; // Recipient ID for outgoing, Sender ID for incoming
  senderPn ?: string; // Push name of the sender
  cleanSenderPn ?: string; // Cleaned push name of the sender
  senderLid ?: string; // LID of the sender
  participant?: string; // For group messages, the ID of the actual sender
  participantLid ?: string; // LID of the participant
  participantPn ?: string; // Push name of the participant
  cleanParticipantPn ?: string; // Cleaned push name of the participant
}

// ---------- Chat Event Payloads ----------
export interface ChatEntry {
  id: string; // Typically the ID of the chat participant or group
  name?: string; // Contact name or group subject
  conversationTimestamp?: number; // Unix timestamp of the last message
  unreadCount?: number;
  muteEndTime?: number;
  isSpam?: boolean;
}

export type ChatsUpsertEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.ChatsUpsert,
  ChatEntry[]
>;
export type ChatsUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.ChatsUpdate,
  Partial<ChatEntry>[]
>; // Updates are often partial
export type ChatsDeleteEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.ChatsDelete,
  string[]
>; // Array of chat IDs


export type GroupsUpsertEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.GroupsUpsert,
  GroupMetadata[]
>;
export type GroupsUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.GroupsUpdate,
  Partial<GroupMetadata>[]
>; // Updates might be partial

import {GroupMetadata, GroupParticipant, GroupParticipant as GroupParticipantObject} from "./groups.ts"; // This import is used by GroupMetadata now

export interface GroupParticipantsUpdateData {
  id: string; // Group ID
  participants: Array<string | GroupParticipantObject>; // Array of participant IDs affected or participant objects
  action: "add" | "remove" | "promote" | "demote";
}
export type GroupParticipantsUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.GroupParticipantsUpdate,
  GroupParticipantsUpdateData
>;

export interface ContactEntry {
  /** ID either in lid or jid format (preferred) **/
  id: string
  /** ID in LID format (@lid) **/
  lid?: string
  /** ID in PN format (@s.whatsapp.net)  **/
  phoneNumber?: string
  /** name of the contact, you have saved on your WA */
  name?: string
  /** name of the contact, the contact has set on their own on WA */
  notify?: string
  /** I have no idea */
  verifiedName?: string
  // Baileys Added
  /**
   * Url of the profile picture of the contact
   *
   * 'changed' => if the profile picture has changed
   * null => if the profile picture has not been set (default profile picture)
   * any other string => url of the profile picture
   */
  imgUrl?: string | null
  status?: string
}
export type ContactsUpsertEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.ContactsUpsert,
  ContactEntry[]
>;
export type ContactsUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.ContactsUpdate,
  Partial<ContactEntry>[]
>;

// ---------- Message Event Payloads ----------
export interface MessageContent {
  conversation?: string; // Plain text message
  extendedTextMessage?: {
    text?: string;
  }
  messageBody?: string;
  imageMessage?: {
    url?: string;
    caption?: string;
    mimetype?: string /* ... */;
    directPath?: string /* ... */;
  };
  videoMessage?: {
    url?: string;
    caption?: string;
    mimetype?: string /* ... */;
    directPath?: string /* ... */;
  };
  documentMessage?: {
    url?: string;
    title?: string;
    mimetype?: string;
    fileName?: string /* ... */;
    directPath?: string /* ... */;

  };
  audioMessage?: {
    url?: string;
    mimetype?: string;
    duration?: number /* ... */;
    directPath?: string /* ... */;
  };
  stickerMessage?: { url?: string; mimetype?: string /* ... */ };
  contactMessage?: { displayName?: string; vcard?: string /* ... */ };
  locationMessage?: {
    degreesLatitude?: number;
    degreesLongitude?: number;
    name?: string;
    address?: string /* ... */;
  };

}

export interface MessagesUpsertData {
  key: MessageKey;
  message?: MessageContent;
  pushName?: string; // Name of the user as set in their WhatsApp profile
  messageTimestamp?: number; // Unix timestamp of the message
}
export type MessagesUpsertEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesUpsert,
  MessagesUpsertData
>; // Typically one message per event, but API might send an array.
// The example showed a single object for `data`.

// ---------- New Specific Message Event Payloads (from provided examples) ----------
export interface IncomingMessageKey {
  id: string;
  fromMe: boolean;
  remoteJid: string; // as examples use `remoteJid`
  participant?: string; // group sender when applicable
}

export interface PersonalMessageData {
  key: IncomingMessageKey;
  message: MessageContent;
}
export type PersonalMessageReceivedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesPersonalReceived,
  PersonalMessageData
>;

export interface NewsletterMessageData {
  key: IncomingMessageKey;
  message: MessageContent;
}
export type NewsletterMessageReceivedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesNewsletterReceived,
  NewsletterMessageData
>;

export interface GroupMessageData {
  key: IncomingMessageKey;
  message: MessageContent;
}
export type GroupMessageReceivedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesGroupReceived,
  GroupMessageData
>;

export interface GenericMessageData {
  key: IncomingMessageKey;
  message: MessageContent;
}
export type MessageReceivedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesReceived,
  GenericMessageData
>;

// ---------- Call Received ----------
export interface CallInfo {
  id: string;
  from: string; // JID
  date: string; // ISO date string as example
  isGroup: boolean;
  isVideo?: boolean;
  status?: string;
}
export type CallReceivedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.CallReceived,
  { call: CallInfo }
>;

// ---------- Poll Results ----------
export interface PollResultEntry {
  name: string;
  voters: string[]; // array of JIDs
}
export interface PollResultsData {
  key: IncomingMessageKey;
  pollResult: PollResultEntry[];
}
export type PollResultsEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.PollResults,
  PollResultsData
>;

export interface MessageUpdate {
  status: "delivered" | "read" | "played" | "error" | "pending"; // 'played' for audio/video, confirm others
  // ... other potential update fields
}
export interface MessagesUpdateDataEntry {
  key: MessageKey;
  update: MessageUpdate;
}
export type MessagesUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesUpdate,
  MessagesUpdateDataEntry[]
>;

export interface MessagesDeleteData {
  keys: MessageKey[];
}
export type MessagesDeleteEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesDelete,
  MessagesDeleteData
>;

export interface Reaction {
  text: string; // The emoji reaction
  key: MessageKey; // Key of the message being reacted to
  senderTimestampMs?: string; // Timestamp of when the reaction was sent
  read?: boolean;
}
export interface MessagesReactionDataEntry {
  key: MessageKey; // Key of the message that received the reaction
  reaction: Reaction;
}
export type MessagesReactionEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessagesReaction,
  MessagesReactionDataEntry[]
>;

// ---------- Message Receipt Update Event Payloads ----------
export interface Receipt {
  userJid: string; // ID of the user whose receipt status changed
  status: "sent" | "delivered" | "read" | "played";
  t?: number; // Timestamp of the status change
}
export interface MessageReceiptUpdateDataEntry {
  key: MessageKey; // Key of the message this receipt pertains to
  receipt: Receipt;
}
export type MessageReceiptUpdateEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessageReceiptUpdate,
  MessageReceiptUpdateDataEntry[]
>;

// ---------- Session Event Payloads ----------
export interface MessageSentData {
  key: MessageKey;
  message?: MessageContent;
  status?: string; // e.g., "sent", "pending"
}
export type MessageSentEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.MessageSent,
  MessageSentData
>;

export interface SessionStatusData {
  status:
    | "connected"
    | "disconnected"
    | "connecting"
    | "error"
    | "logged_out"
    | "need_scan";
  session_id?: string;
  reason?: string;
}
export type SessionStatusEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.SessionStatus,
  SessionStatusData
>;

export interface QrCodeUpdatedData {
  qr: string; // Base64 encoded QR code image data URI
  session_id?: string;
}
export type QrCodeUpdatedEvent = BaseWebhookEvent<
  typeof WasenderWebhookEventType.QrCodeUpdated,
  QrCodeUpdatedData
>;

// ---------- Discriminated Union of All Webhook Events ----------
export type WasenderWebhookEvent =
  | ChatsUpsertEvent
  | ChatsUpdateEvent
  | ChatsDeleteEvent
  | GroupsUpsertEvent
  | GroupsUpdateEvent
  | GroupParticipantsUpdateEvent
  | ContactsUpsertEvent
  | ContactsUpdateEvent
  | MessagesUpsertEvent
  | PersonalMessageReceivedEvent
  | NewsletterMessageReceivedEvent
  | GroupMessageReceivedEvent
  | MessageReceivedEvent
  | CallReceivedEvent
  | PollResultsEvent
  | MessagesUpdateEvent
  | MessagesDeleteEvent
  | MessagesReactionEvent
  | MessageReceiptUpdateEvent
  | MessageSentEvent
  | SessionStatusEvent
  | QrCodeUpdatedEvent;

/** Generic fallback event for unknown event names — preserves the original event string. */
export interface FallbackWebhookEvent {
  event: string; // Preserve the original unknown event name
  timestamp?: number;
  data: any;
  sessionId?: string;
  raw?: any;
}

/**
 * Dispatch a raw parsed webhook payload into one of the typed WasenderWebhookEvent variants
 * or the FallbackWebhookEvent that preserves the original event string.
 */
export function dispatchWebhookEvent(
  raw: any
): WasenderWebhookEvent | FallbackWebhookEvent {
  if (!raw || typeof raw !== "object" || !raw.event) {
    return { event: "unknown", data: raw, raw } as FallbackWebhookEvent;
  }

  const ev = raw.event as string;
  switch (ev) {
    case WasenderWebhookEventType.MessagesUpsert:
      return raw as MessagesUpsertEvent;
    case WasenderWebhookEventType.MessagesUpdate:
      return raw as MessagesUpdateEvent;
    case WasenderWebhookEventType.MessagesDelete:
      return raw as MessagesDeleteEvent;
    case WasenderWebhookEventType.MessagesReaction:
      return raw as MessagesReactionEvent;
    case WasenderWebhookEventType.MessageReceiptUpdate:
      return raw as MessageReceiptUpdateEvent;
    case WasenderWebhookEventType.MessageSent:
      return raw as MessageSentEvent;
    case WasenderWebhookEventType.SessionStatus:
      return raw as SessionStatusEvent;
    case WasenderWebhookEventType.QrCodeUpdated:
      return raw as QrCodeUpdatedEvent;
    case WasenderWebhookEventType.CallReceived:
      return raw as CallReceivedEvent;
    case WasenderWebhookEventType.MessagesPersonalReceived:
      return raw as PersonalMessageReceivedEvent;
    case WasenderWebhookEventType.MessagesNewsletterReceived:
      return raw as NewsletterMessageReceivedEvent;
    case WasenderWebhookEventType.MessagesGroupReceived:
      return raw as GroupMessageReceivedEvent;
    case WasenderWebhookEventType.MessagesReceived:
      return raw as MessageReceivedEvent;
    case WasenderWebhookEventType.PollResults:
      return raw as PollResultsEvent;
    case WasenderWebhookEventType.ChatsUpsert:
    case WasenderWebhookEventType.ChatsUpdate:
    case WasenderWebhookEventType.ChatsDelete:
    case WasenderWebhookEventType.GroupsUpsert:
    case WasenderWebhookEventType.GroupsUpdate:
    case WasenderWebhookEventType.GroupParticipantsUpdate:
    case WasenderWebhookEventType.ContactsUpsert:
    case WasenderWebhookEventType.ContactsUpdate:
      // Let TS narrow by returning as any of the union above
      return raw as WasenderWebhookEvent;
    default:
      return {
        event: ev,
        timestamp: raw.timestamp,
        data: raw.data,
        sessionId: raw.sessionId,
        raw,
      } as FallbackWebhookEvent;
  }
}

/*
// Example of how to process different event types after parsing:
function processParsedWebhookEvent(event: WasenderWebhookEvent) {
  console.log('Processing event type:', event.event);
  switch (event.event) {
    case WasenderWebhookEventType.MessagesUpsert:
      console.log('New message from:', event.data.key.remoteId, 'ID:', event.data.key.id);
      if (event.data.message?.conversation) {
        console.log('Text:', event.data.message.conversation);
      }
      break;
    case WasenderWebhookEventType.SessionStatus:
      console.log('Session status changed:', event.data.status);
      break;
    // ... Add cases for all other event types defined in the union
    default:
      const unhandledEvent: never = event; 
      console.warn('Received an unhandled webhook event type:', unhandledEvent);
      break;
  }
}
*/
