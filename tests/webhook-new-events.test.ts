import { dispatchWebhookEvent } from "../src/webhook";

describe("Webhook dispatcher - new events", () => {
  test("dispatches call.received as CallReceivedEvent", () => {
    const raw = {
      event: "call.received",
      timestamp: 1697640000,
      data: {
        call: {
          id: "call123",
          from: "12345@s.whatsapp.net",
          date: "2025-10-17T12:00:00Z",
          isGroup: false,
        },
      },
      sessionId: "session1",
    };

    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("call.received");
    // @ts-ignore - runtime asserts
    expect(dispatched.data.call.id).toBe("call123");
  });

  test("dispatches messages-personal.received as PersonalMessageReceivedEvent", () => {
    const raw = {
      event: "messages-personal.received",
      timestamp: 1697640000,
      data: {
        key: { id: "msg1", fromMe: false, remoteJid: "12345@s.whatsapp.net" },
        message: { conversation: "hello" },
      },
      sessionId: "session2",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("messages-personal.received");
    // @ts-ignore
    expect(dispatched.data.message.conversation).toBe("hello");
  });

  test("dispatches messages-newsletter.received as NewsletterMessageReceivedEvent", () => {
    const raw = {
      event: "messages-newsletter.received",
      timestamp: 1697640000,
      data: {
        key: { id: "msg2", fromMe: false, remoteJid: "12345@s.whatsapp.net" },
        message: { conversation: "promo" },
      },
      sessionId: "session3",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("messages-newsletter.received");
    // @ts-ignore
    expect(dispatched.data.message.conversation).toBe("promo");
  });

  test("dispatches messages-group.received as GroupMessageReceivedEvent", () => {
    const raw = {
      event: "messages-group.received",
      timestamp: 1697640000,
      data: {
        key: {
          id: "msg3",
          fromMe: false,
          remoteJid: "99999-161@g.us",
          participant: "12345@s.whatsapp.net",
        },
        message: { conversation: "group hello" },
      },
      sessionId: "session4",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("messages-group.received");
    // @ts-ignore
    expect(dispatched.data.message.conversation).toBe("group hello");
  });

  test("dispatches messages.received as MessageReceivedEvent", () => {
    const raw = {
      event: "messages.received",
      timestamp: 1697640000,
      data: {
        key: { id: "msg4", fromMe: false, remoteJid: "12345@s.whatsapp.net" },
        message: { conversation: "generic" },
      },
      sessionId: "session5",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("messages.received");
    // @ts-ignore
    expect(dispatched.data.message.conversation).toBe("generic");
  });

  test("dispatches poll.results as PollResultsEvent", () => {
    const raw = {
      event: "poll.results",
      timestamp: 1697640000,
      data: {
        key: { id: "poll1", fromMe: false, remoteJid: "12345@s.whatsapp.net" },
        pollResult: [{ name: "Option 1", voters: ["12345@s.whatsapp.net"] }],
      },
      sessionId: "session6",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect(dispatched.event).toBe("poll.results");
    // @ts-ignore
    expect(dispatched.data.pollResult[0].name).toBe("Option 1");
  });

  test("unknown event returns fallback preserving event name", () => {
    const raw = {
      event: "unknown.custom.event",
      timestamp: 1697640000,
      data: { foo: "bar" },
      sessionId: "sessionX",
    };
    const dispatched = dispatchWebhookEvent(raw);
    expect((dispatched as any).event).toBe("unknown.custom.event");
    // @ts-ignore
    expect((dispatched as any).data.foo).toBe("bar");
  });
});
