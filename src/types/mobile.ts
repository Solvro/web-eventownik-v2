/**
 * Shapes of the mobile app (participant PWA) API.
 * Participant endpoints live under `/mobile/events/:eventSlug/...`,
 * organizer endpoints under `/events/:eventUuid/mobile/...`.
 * Every date is an ISO 8601 string.
 */

// ---------------------------------------------------------------------------
// Public + auth
// ---------------------------------------------------------------------------

export interface MobileFeatures {
  sos: boolean;
  schedule: boolean;
  chat: boolean;
  tinder: boolean;
  bingo: boolean;
  bereal: boolean;
  soundboard: boolean;
}

/** GET /mobile/events/:eventSlug (public, 404 when the app is not enabled) */
export interface MobilePublicConfig {
  event: {
    uuid: string;
    name: string;
    slug: string;
    primaryColor: string | null;
    photoUrl: string | null;
    startDate: string;
    endDate: string;
    location: string | null;
    organizerName: string | null;
  };
  app: {
    welcomeMessage: string | null;
    /** Hex accent colour (#rrggbb); when null the event primaryColor is used */
    accentColor: string | null;
    features: MobileFeatures;
  };
}

export interface MobileProfile {
  participantUuid: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  tinderOptIn: boolean;
}

/** GET /me */
export interface MobileMe {
  participant: { uuid: string; email: string };
  /** null until the participant finishes onboarding */
  profile: MobileProfile | null;
}

/** POST /auth/otp/verify { email, code } */
export interface MobileOtpVerifyResponse extends MobileMe {
  token: string;
  expiresAt: string;
}

/** PUT /me/profile */
export interface MobileProfilePayload {
  displayName: string;
  bio?: string | null;
  tinderOptIn?: boolean;
}

// ---------------------------------------------------------------------------
// Info tabs
// ---------------------------------------------------------------------------

/** GET /notifications?afterSeq= (newest first, max 100) */
export interface MobileNotification {
  uuid: string;
  seq: number;
  title: string;
  body: string;
  /**
   * Screen of the app the announcement opens when tapped: "bereal" for the
   * announcement of a new round, null for a plain announcement.
   */
  link: string | null;
  createdAt: string;
}

/** GET /schedule (ascending by startsAt) */
export interface MobileScheduleItem {
  uuid: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
}

export interface MobileSosContact {
  uuid: string;
  label: string;
  phone: string;
  description: string | null;
  order: number;
}

export interface MobileFaqItem {
  uuid: string;
  question: string;
  answer: string;
  order: number;
}

/** GET /sos */
export interface MobileSos {
  contacts: MobileSosContact[];
  faq: MobileFaqItem[];
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface MobilePerson {
  participantUuid: string;
  displayName: string;
  photoUrl: string | null;
}

/** GET /chat/rooms (event room first, then direct rooms by latest message) */
export interface MobileChatRoom {
  uuid: string;
  type: "EVENT" | "DIRECT";
  /** Event name for the event room, the other person's name for a direct room */
  title: string;
  photoUrl: string | null;
  lastMessage: {
    body: string;
    createdAt: string;
    senderName: string | null;
  } | null;
  unreadCount: number;
}

/** A GIF attached to a chat message (a GIPHY media URL) */
export interface MobileChatGif {
  url: string;
  width: number;
  height: number;
}

/** One result of GET /chat/gifs */
export interface MobileGif extends MobileChatGif {
  id: string;
  title: string;
  /** Smaller rendition for the picker grid */
  previewUrl: string;
}

/** GET /chat/gifs?q=&offset= (trending when q is empty) */
export interface MobileGifSearch {
  /** False when the server has no GIF provider configured */
  enabled: boolean;
  results: MobileGif[];
  nextOffset: number | null;
}

/** Short view of the message a reply points to */
export interface MobileChatReplyTo {
  uuid: string;
  seq: number;
  /** null when that message was deleted */
  body: string | null;
  senderName: string;
  isMine: boolean;
}

/**
 * GET /chat/rooms/:roomUuid/messages?afterSeq=&beforeSeq=&limit= (ascending by seq;
 * without a cursor the latest 50). Reading marks the room as read.
 * POST /chat/rooms/:roomUuid/messages { body?, gif?, replyToUuid? } returns the
 * created message; it needs text or a GIF. replyToUuid must be a live message
 * of the same room (400 otherwise). A GIF-only message has an empty body.
 */
export interface MobileChatMessage {
  uuid: string;
  seq: number;
  body: string;
  createdAt: string;
  /** null for organizer messages */
  sender: MobilePerson | null;
  isOrganizer: boolean;
  isMine: boolean;
  replyTo: MobileChatReplyTo | null;
  gif: MobileChatGif | null;
}

// ---------------------------------------------------------------------------
// Tinderownik
// ---------------------------------------------------------------------------

/** GET /tinder/candidates?limit=20 */
export interface MobileTinderCandidate extends MobilePerson {
  bio: string | null;
}

/** POST /tinder/swipes { toParticipantUuid, liked } */
export interface MobileSwipeResult {
  matched: boolean;
  /** Direct chat room, set when matched */
  roomUuid: string | null;
}

/** GET /tinder/matches (newest first) */
export interface MobileTinderMatch extends MobileTinderCandidate {
  roomUuid: string;
  matchedAt: string;
}

// ---------------------------------------------------------------------------
// Bingo
// ---------------------------------------------------------------------------

export interface MobileBingoCell {
  taskUuid: string;
  text: string;
  completed: boolean;
  photoUrl: string | null;
  /** Text the participant added when completing the task */
  note: string | null;
  completedAt: string | null;
}

/**
 * GET /bingo
 * POST /bingo/tasks/:taskUuid/complete (multipart, optional `photo`)
 * DELETE /bingo/tasks/:taskUuid/complete
 * All three return the board. `cells` has size * size entries in row order;
 * it is empty when the organizer has not added enough tasks.
 */
export interface MobileBingoBoard {
  size: number;
  cells: MobileBingoCell[];
  completedCount: number;
  /** Number of complete rows, columns and diagonals */
  bingoLines: number;
  hasBingo: boolean;
  /** Time window set by the organizer; null = no limit on that side */
  startsAt: string | null;
  endsAt: string | null;
  /** Tasks can be ticked only while "active" */
  status: "upcoming" | "active" | "ended";
}

/** GET /bingo/leaderboard (top 20) */
export interface MobileBingoLeaderboardEntry extends MobilePerson {
  completedCount: number;
  /** When they ticked their latest task: with the same count, earlier ranks higher */
  lastCompletedAt: string;
}

// ---------------------------------------------------------------------------
// BeReal
// ---------------------------------------------------------------------------

export interface MobileBerealRound {
  uuid: string;
  prompt: string | null;
  startedAt: string;
  endsAt: string;
}

/**
 * POST /bereal/rounds/:roundUuid/posts (multipart: `photo` required, `selfie` and `caption` optional)
 * GET /bereal/rounds/:roundUuid/posts (403 until the participant posted in that round or it ended)
 */
export interface MobileBerealPost {
  uuid: string;
  photoUrl: string;
  selfieUrl: string | null;
  caption: string | null;
  isLate: boolean;
  createdAt: string;
  author: MobilePerson;
  isMine: boolean;
}

/** GET /bereal */
export interface MobileBerealState {
  /** Latest round, null if the organizer never started one */
  round: MobileBerealRound | null;
  /** True while now < round.endsAt */
  isActive: boolean;
  myPost: MobileBerealPost | null;
  canViewFeed: boolean;
}

/** GET /push — Web Push availability; publicKey is the VAPID key (base64url) */
export interface MobilePushConfig {
  enabled: boolean;
  publicKey: string | null;
}

// ---------------------------------------------------------------------------
// Organizer (dashboard) — /events/:eventUuid/mobile
// ---------------------------------------------------------------------------

/** GET / PUT (partial body) /events/:eventUuid/mobile */
export interface MobileAppConfig {
  isEnabled: boolean;
  welcomeMessage: string | null;
  /** Hex accent colour (#rrggbb) of the participant app, null = event primaryColor */
  accentColor: string | null;
  sosEnabled: boolean;
  scheduleEnabled: boolean;
  chatEnabled: boolean;
  tinderEnabled: boolean;
  bingoEnabled: boolean;
  berealEnabled: boolean;
  soundboardEnabled: boolean;
  bingoSize: number;
  /** Bingo can be played only inside this window; null = no limit on that side */
  bingoStartsAt: string | null;
  bingoEndsAt: string | null;
  /** Read-only: participants who finished onboarding */
  profilesCount: number;
}

export type MobileAppConfigPayload = Partial<
  Omit<MobileAppConfig, "profilesCount">
>;

export type MobileSosContactPayload = Pick<
  MobileSosContact,
  "label" | "phone"
> &
  Partial<Pick<MobileSosContact, "description" | "order">>;

export type MobileFaqItemPayload = Pick<MobileFaqItem, "question" | "answer"> &
  Partial<Pick<MobileFaqItem, "order">>;

export type MobileScheduleItemPayload = Pick<
  MobileScheduleItem,
  "title" | "startsAt"
> &
  Partial<Pick<MobileScheduleItem, "description" | "location" | "endsAt">>;

export interface MobileNotificationPayload {
  title: string;
  body: string;
}

/** /bingo-tasks */
/** GET /events/:uuid/mobile/bingo-completions: one ticked task, newest first */
export interface MobileBingoCompletionAdmin {
  uuid: string;
  taskUuid: string;
  taskText: string;
  participant: MobilePerson & { email: string };
  photoUrl: string | null;
  note: string | null;
  completedAt: string;
}

export interface MobileBingoTaskAdmin {
  uuid: string;
  text: string;
  order: number;
  completionsCount: number;
}

// Tinderownik (organizer) --------------------------------------------------

/** One participant with a profile, with their Tinderownik activity */
export interface MobileTinderPersonAdmin extends MobilePerson {
  email: string;
  tinderOptIn: boolean;
  likesGiven: number;
  passesGiven: number;
  likesReceived: number;
  matchesCount: number;
}

/** A mutual like; matchedAt is when the second of the two likes happened */
export interface MobileTinderMatchAdmin {
  a: MobilePerson;
  b: MobilePerson;
  matchedAt: string;
}

/** GET /events/:uuid/mobile/tinder */
export interface MobileTinderOverview {
  totals: { optedIn: number; swipes: number; likes: number; matches: number };
  /** Most active first */
  people: MobileTinderPersonAdmin[];
  /** Newest first */
  matches: MobileTinderMatchAdmin[];
}

export interface MobileTinderSwipeAdmin {
  /** The other side of the swipe */
  person: MobilePerson;
  liked: boolean;
  swipedAt: string;
  /** How the swipe was answered from the other side; null = not swiped back yet */
  reciprocal: boolean | null;
}

/** GET /events/:uuid/mobile/tinder/participants/:participantUuid */
export interface MobileTinderParticipantSwipes {
  participant: MobileTinderPersonAdmin;
  /** Their swipes on others, newest first */
  given: MobileTinderSwipeAdmin[];
  /** Others' swipes on them, newest first; reciprocal = their answer */
  received: MobileTinderSwipeAdmin[];
}

/** /bereal-rounds; POST body { prompt?, durationMinutes? (default 5) } */
export interface MobileBerealRoundAdmin extends MobileBerealRound {
  postsCount: number;
}

/** One pad of the shared soundboard */
export interface MobileSoundboardPad {
  uuid: string;
  /** 0-8, row by row */
  slot: number;
  caption: string;
  audioUrl: string;
  audioMime: string;
  /** Measured while recording; recordings may not report their own length */
  durationMs: number | null;
  imageUrl: string | null;
  /** Who last recorded or edited it */
  author: MobilePerson | null;
  updatedAt: string;
}

/** GET /mobile/events/:eventSlug/soundboard */
export interface MobileSoundboard {
  /** Always nine entries; null marks an empty pad */
  pads: (MobileSoundboardPad | null)[];
}
