/*
 * Wasender TypeScript SDK - Contact Management Types
 * Defines structures for contact information, API responses related to contacts.
 */

import { RateLimitInfo } from "./messages"; // Assuming RateLimitInfo is in messages.ts
import { WasenderSuccessResponse } from "./messages"; // Reusing generic success response

// ---------- Contact Data Structures ----------

export interface Contact {
  /** The id (Jabber ID) of the contact, typically a phone number. */
  id: string;
  /** The name of the contact as saved by the user. */
  name?: string; // WhatsApp might not always provide this
  /** The display name of the contact (push name). */
  notify?: string;
  /** The verified business name, if applicable. */
  verifiedName?: string;
  /** URL of the contact\'s profile picture. */
  imgUrl?: string;
  /** The contact\'s status message. */
  status?: string;
  /** Indicates if the contact exists on WhatsApp. */
  exists?: boolean;
}

// ---------- API Response Types for Contacts ----------

/** Response for retrieving a list of all contacts. */
export interface GetAllContactsResponse extends WasenderSuccessResponse {
  data: Contact[];
}

/** Response for retrieving information about a single contact. */
export interface GetContactInfoResponse extends WasenderSuccessResponse {
  data: Contact; // `exists` field is particularly relevant here
}

/** Response for retrieving a contact\'s profile picture URL. */
export interface GetContactProfilePictureResponse extends WasenderSuccessResponse {
  data: {
    imgUrl: string | null; // imgUrl can be null if no picture
  };
}

/** Response for blocking or unblocking a contact. */
export interface ContactActionResponse extends WasenderSuccessResponse {
  data: {
    message: string;
  };
}

// ---------- Result Types Including Rate Limiting ----------

/** Combined result for a successful "get all contacts" API call. */
export interface GetAllContactsResult {
  response: GetAllContactsResponse;
  rateLimit?: RateLimitInfo;
}

/** Combined result for a successful "get contact info" API call. */
export interface GetContactInfoResult {
  response: GetContactInfoResponse;
  rateLimit?: RateLimitInfo;
}

/** Combined result for a successful "get contact profile picture" API call. */
export interface GetContactProfilePictureResult {
  response: GetContactProfilePictureResponse;
  rateLimit?: RateLimitInfo;
}

/** Combined result for a successful contact action (block/unblock) API call. */
export interface ContactActionResult {
  response: ContactActionResponse;
  rateLimit?: RateLimitInfo;
}
