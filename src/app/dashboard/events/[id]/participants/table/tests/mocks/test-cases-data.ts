import type { Attribute, AttributeType } from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export interface TestCaseData {
  participants: Participant[];
  attributes: Attribute[];
  emails?: EventEmail[];
  attributeType?: AttributeType;
}

// There are no test cases for blocks and files

export const textCaseData: TestCaseData = {
  participants: [
    // Initial order: Medium, Alpha, Zebra (neither ascending nor descending)
    {
      id: 2,
      email: "bob@domain.com", // email domain changed for filtering tests
      slug: "bob",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Medium", // Middle value
        },
      ],
    },
    {
      id: 1,
      email: "anna@domain.com", // email domain changed for filtering tests
      slug: "anna",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Alpha", // First alphabetically
        },
      ],
    },
    {
      id: 3,
      email: "charlie@example.com",
      slug: "charlie",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Zebra", // Last alphabetically
        },
      ],
    },
  ],
  attributes: [
    {
      id: 4,
      name: "Nickname",
      slug: "nickname",
      eventId: 100,
      showInList: true,
      options: null,
      type: "text",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
    },
  ] as Attribute[],
  attributeType: "text",
  emails: [
    {
      id: 1001,
      eventId: 250,
      name: "Welcome Email - New Registration",
      trigger: "participant_registered",
      triggerValue: null,
      triggerValue2: null,
      createdAt: "2024-12-15T09:30:00.000Z",
      updatedAt: "2025-01-20T14:22:15.000Z",
      meta: {
        failedCount: "3",
        pendingCount: "12",
        sentCount: "847",
      },
    },

    {
      id: 1002,
      eventId: 250,
      name: "VIP Upgrade Notification",
      trigger: "attribute_changed",
      triggerValue: "ticket_type", // AI generated slop - idk if it makes any sense
      triggerValue2: "VIP", // AI generated slop - idk if it makes any sense
      createdAt: "2024-11-08T16:45:30.000Z",
      updatedAt: "2025-02-01T11:18:42.000Z",
      meta: {
        failedCount: "1",
        pendingCount: "0",
        sentCount: "23",
      },
    },
  ],
};

export const selectCaseData: TestCaseData = {
  participants: [
    // Initial order: Male, Female, Other (not alphabetical)
    {
      id: 4,
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Male",
        },
      ],
    },
    {
      id: 3,
      email: "carol@example.com",
      slug: "carol",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Female",
        },
      ],
    },
    {
      id: 5,
      email: "eli@example.com",
      slug: "eli",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Other",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 6,
      name: "Gender",
      slug: "gender",
      eventId: 100,
      showInList: true,
      options: ["Male", "Female", "Other"],
      type: "select",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
    },
  ],
  attributeType: "select",
};

export const emailCaseData: TestCaseData = {
  participants: [
    // Initial order: middle@, auser@, zuser@ (not sorted)
    {
      id: 6,
      email: "frank@example.com",
      slug: "frank",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
      attributes: [
        {
          id: 7,
          name: "Contact Email",
          slug: "contact-email",
          value: "middle@example.com",
        },
      ],
    },
    {
      id: 7,
      email: "grace@example.com",
      slug: "grace",
      createdAt: "2025-07-01T10:06:00Z",
      updatedAt: "2025-07-01T10:06:00Z",
      attributes: [
        {
          id: 7,
          name: "Contact Email",
          slug: "contact-email",
          value: "auser@example.com",
        },
      ],
    },
    {
      id: 8,
      email: "henry@example.com",
      slug: "henry",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          id: 7,
          name: "Contact Email",
          slug: "contact-email",
          value: "zuser@example.com",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 7,
      name: "Contact Email",
      slug: "contact-email",
      eventId: 100,
      showInList: true,
      options: null,
      type: "email",
      createdAt: "2025-07-01T10:06:00Z",
      updatedAt: "2025-07-01T10:06:00Z",
    },
  ],
  attributeType: "email",
};

export const textareaCaseData: TestCaseData = {
  participants: [
    // Initial order: Love hiking, Software engineer, Creative writer
    {
      id: 9,
      email: "ivy@example.com",
      slug: "ivy",
      createdAt: "2025-07-01T10:08:00Z",
      updatedAt: "2025-07-01T10:08:00Z",
      attributes: [
        {
          id: 8,
          name: "About Me",
          slug: "about-me",
          value: "Love hiking and running marathons.",
        },
      ],
    },
    {
      id: 8,
      email: "hank@example.com",
      slug: "hank",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          id: 8,
          name: "About Me",
          slug: "about-me",
          value: "Software engineer and cat lover.",
        },
      ],
    },
    {
      id: 10,
      email: "jack@example.com",
      slug: "jack",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          id: 8,
          name: "About Me",
          slug: "about-me",
          value: "Creative writer and book enthusiast.",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 8,
      name: "About Me",
      slug: "about-me",
      eventId: 100,
      showInList: true,
      options: null,
      type: "textarea",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
    },
  ],
  attributeType: "textarea",
};

export const multiselectCaseData: TestCaseData = {
  participants: [
    // Initial order: Rust,Go then Go,Rust then JavaScript,Python (not alphabetical)
    {
      id: 12,
      email: "aren@example.com",
      slug: "aren",
      createdAt: "2025-07-01T10:10:00Z",
      updatedAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "Rust,Go",
        },
      ],
    },
    {
      id: 11,
      email: "karen@example.com",
      slug: "karen",
      createdAt: "2025-07-01T10:10:00Z",
      updatedAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "Go,Rust",
        },
      ],
    },
    {
      id: 10,
      email: "john@example.com",
      slug: "john",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "JavaScript,Python",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 10,
      name: "Skills",
      slug: "skills",
      eventId: 100,
      showInList: true,
      options: ["JavaScript", "Python", "Rust", "Go"],
      type: "multiselect",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
    },
  ],
  attributeType: "multiselect",
};

export const colorCaseData: TestCaseData = {
  participants: [
    // Initial order: #0000ff (blue), #ff0000 (red), #00ff00 (green)
    {
      id: 13,
      email: "mila@example.com",
      slug: "mila",
      createdAt: "2025-07-01T10:12:00Z",
      updatedAt: "2025-07-01T10:12:00Z",
      attributes: [
        {
          id: 14,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#0000ff", // blue
        },
      ],
    },
    {
      id: 12,
      email: "leo@example.com",
      slug: "leo",
      createdAt: "2025-07-01T10:11:00Z",
      updatedAt: "2025-07-01T10:11:00Z",
      attributes: [
        {
          id: 14,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#ff0000", // red
        },
      ],
    },
    {
      id: 14,
      email: "nina@example.com",
      slug: "nina",
      createdAt: "2025-07-01T10:13:00Z",
      updatedAt: "2025-07-01T10:13:00Z",
      attributes: [
        {
          id: 14,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#00ff00", // green
        },
      ],
    },
  ],
  attributes: [
    {
      id: 14,
      name: "Favorite Color",
      slug: "favorite-color",
      eventId: 100,
      showInList: true,
      options: null,
      type: "color",
      createdAt: "2025-07-01T10:13:00Z",
      updatedAt: "2025-07-01T10:13:00Z",
    },
  ],
  attributeType: "color",
};

export const numberCaseData: TestCaseData = {
  participants: [
    // Initial order: 35, 22, 45 (not in ascending or descending order)
    {
      id: 16,
      email: "peter@example.com",
      slug: "peter",
      createdAt: "2025-07-01T11:02:00Z",
      updatedAt: "2025-07-01T11:02:00Z",
      attributes: [
        {
          id: 1,
          name: "Age",
          slug: "age",
          value: "35",
        },
      ],
    },
    {
      id: 14,
      email: "noah@example.com",
      slug: "noah",
      createdAt: "2025-07-01T11:00:00Z",
      updatedAt: "2025-07-01T11:00:00Z",
      attributes: [
        {
          id: 1,
          name: "Age",
          slug: "age",
          value: "22",
        },
      ],
    },
    {
      id: 15,
      email: "olivia@example.com",
      slug: "olivia",
      createdAt: "2025-07-01T11:01:00Z",
      updatedAt: "2025-07-01T11:01:00Z",
      attributes: [
        {
          id: 1,
          name: "Age",
          slug: "age",
          value: "45",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 1,
      name: "Age",
      slug: "age",
      eventId: 100,
      showInList: true,
      options: null,
      type: "number",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
    },
  ],
  attributeType: "number",
};

export const telCaseData: TestCaseData = {
  participants: [
    // Initial order: +49, +1, +44 (not in ascending order)
    {
      id: 28,
      email: "bella@example.com",
      slug: "bella",
      createdAt: "2025-07-01T14:02:00Z",
      updatedAt: "2025-07-01T14:02:00Z",
      attributes: [
        {
          id: 13,
          name: "Phone Number",
          slug: "phone-number",
          value: "+49-151-12345678",
        },
      ],
    },
    {
      id: 26,
      email: "zoe@example.com",
      slug: "zoe",
      createdAt: "2025-07-01T14:00:00Z",
      updatedAt: "2025-07-01T14:00:00Z",
      attributes: [
        {
          id: 13,
          name: "Phone Number",
          slug: "phone-number",
          value: "+1-202-555-0101",
        },
      ],
    },
    {
      id: 27,
      email: "alex@example.com",
      slug: "alex",
      createdAt: "2025-07-01T14:01:00Z",
      updatedAt: "2025-07-01T14:01:00Z",
      attributes: [
        {
          id: 13,
          name: "Phone Number",
          slug: "phone-number",
          value: "+44-7700-900123",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 13,
      name: "Phone Number",
      slug: "phone-number",
      eventId: 100,
      showInList: true,
      options: null,
      type: "tel",
      createdAt: "2025-07-01T10:12:00Z",
      updatedAt: "2025-07-01T10:12:00Z",
    },
  ],
  attributeType: "tel",
};

export const checkboxCaseData: TestCaseData = {
  participants: [
    // Initial order: true, false, true (not sorted)
    {
      id: 23,
      email: "will@example.com",
      slug: "will",
      createdAt: "2025-07-01T13:00:00Z",
      updatedAt: "2025-07-01T13:00:00Z",
      attributes: [
        {
          id: 2,
          name: "Subscribed",
          slug: "subscribed",
          value: "true",
        },
      ],
    },
    {
      id: 24,
      email: "xena@example.com",
      slug: "xena",
      createdAt: "2025-07-01T13:01:00Z",
      updatedAt: "2025-07-01T13:01:00Z",
      attributes: [
        {
          id: 2,
          name: "Subscribed",
          slug: "subscribed",
          value: "false",
        },
      ],
    },
    {
      id: 25,
      email: "yuri@example.com",
      slug: "yuri",
      createdAt: "2025-07-01T13:02:00Z",
      updatedAt: "2025-07-01T13:02:00Z",
      attributes: [
        {
          id: 2,
          name: "Subscribed",
          slug: "subscribed",
          value: "true",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 2,
      name: "Subscribed",
      slug: "subscribed",
      eventId: 100,
      showInList: true,
      options: null,
      type: "checkbox",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
    },
  ],
  attributeType: "checkbox",
};

export const timeCaseData: TestCaseData = {
  participants: [
    // Initial order: 17:15, 08:30, 12:45 (not in time order)
    {
      id: 20,
      email: "tom@example.com",
      slug: "tom",
      createdAt: "2025-07-01T12:03:00Z",
      updatedAt: "2025-07-01T12:03:00Z",
      attributes: [
        {
          id: 3,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "17:15:00",
        },
      ],
    },
    {
      id: 19,
      email: "sara@example.com",
      slug: "sara",
      createdAt: "2025-07-01T12:02:00Z",
      updatedAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          id: 3,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "08:30:00",
        },
      ],
    },
    {
      id: 21,
      email: "una@example.com",
      slug: "una",
      createdAt: "2025-07-01T12:04:00Z",
      updatedAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          id: 3,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "12:45:00",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 3,
      name: "Preferred Time",
      slug: "preferred-time",
      eventId: 100,
      showInList: false,
      options: null,
      type: "time",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
    },
  ],
  attributeType: "time",
};

export const dateCaseData: TestCaseData = {
  participants: [
    // Initial order: 1990-05-14, 1985-11-20, 1995-03-08 (not sorted)
    {
      id: 18,
      email: "ryan@example.com",
      slug: "ryan",
      createdAt: "2025-07-01T12:01:00Z",
      updatedAt: "2025-07-01T12:01:00Z",
      attributes: [
        {
          id: 12,
          name: "Birth Date",
          slug: "birth-date",
          value: "1990-05-14",
        },
      ],
    },
    {
      id: 17,
      email: "quinn@example.com",
      slug: "quinn",
      createdAt: "2025-07-01T12:00:00Z",
      updatedAt: "2025-07-01T12:00:00Z",
      attributes: [
        {
          id: 12,
          name: "Birth Date",
          slug: "birth-date",
          value: "1985-11-20",
        },
      ],
    },
    {
      id: 19,
      email: "sophie@example.com",
      slug: "sophie",
      createdAt: "2025-07-01T12:02:00Z",
      updatedAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          id: 12,
          name: "Birth Date",
          slug: "birth-date",
          value: "1995-03-08",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 12,
      name: "Birth Date",
      slug: "birth-date",
      eventId: 100,
      showInList: true,
      options: null,
      type: "date",
      createdAt: "2025-07-01T10:11:00Z",
      updatedAt: "2025-07-01T10:11:00Z",
    },
  ],
  attributeType: "date",
};

export const datetimeCaseData: TestCaseData = {
  participants: [
    // Initial order: 2025-07-01T14:45, 2025-06-10T09:15, 2025-08-15T18:30
    {
      id: 22,
      email: "vince@example.com",
      slug: "vince",
      createdAt: "2025-07-01T12:05:00Z",
      updatedAt: "2025-07-01T12:05:00Z",
      attributes: [
        {
          id: 5,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-07-01T14:45:00Z",
        },
      ],
    },
    {
      id: 21,
      email: "uma@example.com",
      slug: "uma",
      createdAt: "2025-07-01T12:04:00Z",
      updatedAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          id: 5,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-06-10T09:15:00Z",
        },
      ],
    },
    {
      id: 23,
      email: "walter@example.com",
      slug: "walter",
      createdAt: "2025-07-01T12:06:00Z",
      updatedAt: "2025-07-01T12:06:00Z",
      attributes: [
        {
          id: 5,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-08-15T18:30:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 5,
      name: "Registration Datetime",
      slug: "registration-datetime",
      eventId: 100,
      showInList: false,
      options: null,
      type: "datetime",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
    },
  ],
  attributeType: "datetime",
};

export const selectAndMultiselectTestCaseData: TestCaseData = {
  participants: [
    {
      id: 4,
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Male",
        },
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "Rust,Go",
        },
      ],
    },
    {
      id: 3,
      email: "carol@example.com",
      slug: "carol",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Female",
        },
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "JavaScript,Python",
        },
      ],
    },
    {
      id: 5,
      email: "eli@example.com",
      slug: "eli",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          id: 6,
          name: "Gender",
          slug: "gender",
          value: "Other",
        },
        {
          id: 10,
          name: "Skills",
          slug: "skills",
          value: "Go,Rust",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 6,
      name: "Gender",
      slug: "gender",
      eventId: 100,
      showInList: true,
      options: ["Male", "Female", "Other"],
      type: "select",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
    },
    {
      id: 10,
      name: "Skills",
      slug: "skills",
      eventId: 100,
      showInList: true,
      options: ["JavaScript", "Python", "Rust", "Go"],
      type: "multiselect",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
    },
  ],
};

export const editParticipantTestCaseData: TestCaseData = {
  participants: [
    {
      id: 4,
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          id: 10,
          name: "Nickname",
          slug: "nickname",
          value: "chewmanji",
        },
      ],
    },
  ],
  attributes: [
    {
      id: 6,
      name: "Age",
      slug: "age",
      eventId: 100,
      showInList: false,
      options: null,
      type: "number",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
    },
    {
      id: 10,
      name: "Nickname",
      slug: "nickname",
      eventId: 100,
      showInList: true,
      options: null,
      type: "text",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
    },
  ],
};

export const editParticipantDetailsTestCaseData: TestCaseData = {
  participants: [
    {
      id: 4,
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          id: 10,
          name: "Nickname",
          slug: "nickname",
          value: "chewmanji",
        },
        {
          id: 6,
          name: "Age",
          slug: "age",
          value: "42",
        },
      ],
    },
  ],
  attributes: [],
};

export const deleteParticipantCaseData: TestCaseData = {
  participants: [
    // Initial order: Medium, Alpha, Zebra (neither ascending nor descending)
    {
      id: 2,
      email: "bob@domain.com",
      slug: "bob",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Medium", // Middle value
        },
      ],
    },
    {
      id: 1,
      email: "anna@domain.com",
      slug: "anna",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Alpha", // First alphabetically
        },
      ],
    },
    {
      id: 3,
      email: "charlie@example.com",
      slug: "charlie",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          id: 4,
          name: "Nickname",
          slug: "nickname",
          value: "Zebra", // Last alphabetically
        },
      ],
    },
  ],
  attributes: [
    {
      id: 4,
      name: "Nickname",
      slug: "nickname",
      eventId: 100,
      showInList: true,
      options: null,
      type: "text",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
    },
  ] as Attribute[],
  attributeType: "text",
};

export const stringLikeDataTestCases = [
  textCaseData,
  selectCaseData,
  emailCaseData,
  textareaCaseData,
  multiselectCaseData,
  colorCaseData,
  numberCaseData,
  telCaseData,
  checkboxCaseData,
  timeCaseData,
  dateCaseData,
  datetimeCaseData,
];
