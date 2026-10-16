import type { Participant } from "@/types/participant";
import type {
  V3Attribute as Attribute,
  V3EmailSummary as EventEmail,
} from "@/types/v3";

type AttributeType = Attribute["type"];

export interface TestCaseData {
  participants: Participant[];
  // TODO(refactor,multiselect-blocks): Adjust the type here after cleaning up `@/types/attributes.ts`
  attributes: Attribute[];
  emails?: EventEmail[];
  attributeType?: AttributeType;
}
const nicknameAttributeUuid = crypto.randomUUID();
const ageAttributeUuid = crypto.randomUUID();
const genderAttributeUuid = crypto.randomUUID();
const skillsAttributeUuid = crypto.randomUUID();
const favoriteColorAttributeUuid = crypto.randomUUID();
const phoneNumberAttributeUuid = crypto.randomUUID();
const subscribedAttributeUuid = crypto.randomUUID();
const preferredTimeAttributeUuid = crypto.randomUUID();
const birthdayAttributeUuid = crypto.randomUUID();
const registrationDateTimeAttributeUuid = crypto.randomUUID();
const contactEmailAttributeUuid = crypto.randomUUID();
const aboutMeAttributeUuid = crypto.randomUUID();
// There are no test cases for blocks and files
export const textCaseData: TestCaseData = {
  participants: [
    // Initial order: Medium, Alpha, Zebra (neither ascending nor descending)
    {
      uuid: crypto.randomUUID(),
      email: "bob@domain.com",
      createdAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Medium",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "anna@domain.com",
      createdAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Alpha",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "charlie@example.com",
      createdAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Zebra",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "text",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      config: {
        options: null,
      },
    },
  ] as Attribute[],
  attributeType: "text",
  emails: [
    {
      name: "Welcome Email - New Registration",
      trigger: "PARTICIPANT_REGISTERED",
      createdAt: "2024-12-15T09:30:00.000Z",
      updatedAt: "2025-01-20T14:22:15.000Z",
      meta: {
        failedCount: 3,
        pendingCount: 12,
        sentCount: 847,
      },
      id: crypto.randomUUID(),
      eventId: "1ac2bfb4-61ae-4cab-9d3d-d5e989e3a458",
      triggerConfig: null,
      schema: null,
    },
    // NOTE: Commented out because the attribute_changed trigger is not yet implemented on the backend.
    // Uncomment when the backend supports this feature.
    // {
    //   id: 1002,
    //   eventUuid: "1ac2bfb4-61ae-4cab-9d3d-d5e989e3a458",
    //   name: "VIP Upgrade Notification",
    //   trigger: "attribute_changed",
    //   triggerValue: "ticket_type", // AI generated slop - idk if it makes any sense
    //   triggerValue2: "VIP", // AI generated slop - idk if it makes any sense
    //   createdAt: "2024-11-08T16:45:30.000Z",
    //   updatedAt: "2025-02-01T11:18:42.000Z",
    //   meta: {
    //     failedCount: "1",
    //     pendingCount: "0",
    //     sentCount: "23",
    //   },
    // },
  ],
};
export const selectCaseData: TestCaseData = {
  participants: [
    // Initial order: Male, Female, Other (not alphabetical)
    {
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      createdAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Male",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "carol@example.com",
      createdAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Female",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "eli@example.com",
      createdAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Other",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: genderAttributeUuid,
      name: "Gender",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "select",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
      config: {
        options: ["Male", "Female", "Other"],
      },
    },
  ],
  attributeType: "select",
};
export const emailCaseData: TestCaseData = {
  participants: [
    // Initial order: middle@, auser@, zuser@ (not sorted)
    {
      uuid: crypto.randomUUID(),
      email: "frank@example.com",
      createdAt: "2025-07-01T10:05:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          value: "middle@example.com",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "grace@example.com",
      createdAt: "2025-07-01T10:06:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          value: "auser@example.com",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "henry@example.com",
      createdAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          value: "zuser@example.com",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: contactEmailAttributeUuid,
      name: "Contact Email",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "email",
      createdAt: "2025-07-01T10:06:00Z",
      updatedAt: "2025-07-01T10:06:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "email",
};
export const textareaCaseData: TestCaseData = {
  participants: [
    // Initial order: Love hiking, Software engineer, Creative writer
    {
      uuid: crypto.randomUUID(),
      email: "ivy@example.com",
      createdAt: "2025-07-01T10:08:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          value: "Love hiking and running marathons.",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "hank@example.com",
      createdAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          value: "Software engineer and cat lover.",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "jack@example.com",
      createdAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          value: "Creative writer and book enthusiast.",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: aboutMeAttributeUuid,
      name: "About Me",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "textArea",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "textArea",
};
export const multiselectCaseData: TestCaseData = {
  participants: [
    // Initial order: Rust,Go then Go,Rust then JavaScript,Python (not alphabetical)
    {
      uuid: crypto.randomUUID(),
      email: "aren@example.com",
      createdAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "Rust,Go",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "karen@example.com",
      createdAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "Go,Rust",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "john@example.com",
      createdAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "JavaScript,Python",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: skillsAttributeUuid,
      name: "Skills",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "multiSelect",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      config: {
        options: ["JavaScript", "Python", "Rust", "Go"],
      },
    },
  ],
  attributeType: "multiSelect",
};
export const colorCaseData: TestCaseData = {
  participants: [
    // Initial order: #0000ff (blue), #ff0000 (red), #00ff00 (green)
    {
      uuid: crypto.randomUUID(),
      email: "mila@example.com",
      createdAt: "2025-07-01T10:12:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          value: "#0000ff",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "leo@example.com",
      createdAt: "2025-07-01T10:11:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          value: "#ff0000",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "nina@example.com",
      createdAt: "2025-07-01T10:13:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          value: "#00ff00",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: favoriteColorAttributeUuid,
      name: "Favorite Color",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "color",
      createdAt: "2025-07-01T10:13:00Z",
      updatedAt: "2025-07-01T10:13:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "color",
};
export const numberCaseData: TestCaseData = {
  participants: [
    // Initial order: 35, 22, 45 (not in ascending or descending order)
    {
      uuid: crypto.randomUUID(),
      email: "peter@example.com",
      createdAt: "2025-07-01T11:02:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          value: "35",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "noah@example.com",
      createdAt: "2025-07-01T11:00:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          value: "22",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "olivia@example.com",
      createdAt: "2025-07-01T11:01:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          value: "45",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: ageAttributeUuid,
      name: "Age",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "number",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "number",
};
export const telCaseData: TestCaseData = {
  participants: [
    // Initial order: +49, +1, +44 (not in ascending order)
    {
      uuid: crypto.randomUUID(),
      email: "bella@example.com",
      createdAt: "2025-07-01T14:02:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          value: "+49-151-12345678",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "zoe@example.com",
      createdAt: "2025-07-01T14:00:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          value: "+1-202-555-0101",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "alex@example.com",
      createdAt: "2025-07-01T14:01:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          value: "+44-7700-900123",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: phoneNumberAttributeUuid,
      name: "Phone Number",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "tel",
      createdAt: "2025-07-01T10:12:00Z",
      updatedAt: "2025-07-01T10:12:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "tel",
};
export const checkboxCaseData: TestCaseData = {
  participants: [
    // Initial order: true, false, true (not sorted)
    {
      uuid: crypto.randomUUID(),
      email: "will@example.com",
      createdAt: "2025-07-01T13:00:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          value: "true",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "xena@example.com",
      createdAt: "2025-07-01T13:01:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          value: "false",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "yuri@example.com",
      createdAt: "2025-07-01T13:02:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          value: "true",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: subscribedAttributeUuid,
      name: "Subscribed",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "checkbox",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "checkbox",
};
export const timeCaseData: TestCaseData = {
  participants: [
    // Initial order: 17:15, 08:30, 12:45 (not in time order)
    {
      uuid: crypto.randomUUID(),
      email: "tom@example.com",
      createdAt: "2025-07-01T12:03:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          value: "17:15:00",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "sara@example.com",
      createdAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          value: "08:30:00",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "una@example.com",
      createdAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          value: "12:45:00",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: preferredTimeAttributeUuid,
      name: "Preferred Time",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
      type: "time",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "time",
};
export const dateCaseData: TestCaseData = {
  participants: [
    // Initial order: 1990-05-14, 1985-11-20, 1995-03-08 (not sorted)
    {
      uuid: crypto.randomUUID(),
      email: "ryan@example.com",
      createdAt: "2025-07-01T12:01:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          value: "1990-05-14",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "quinn@example.com",
      createdAt: "2025-07-01T12:00:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          value: "1985-11-20",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "sophie@example.com",
      createdAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          value: "1995-03-08",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: birthdayAttributeUuid,
      name: "Birth Date",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "date",
      createdAt: "2025-07-01T10:11:00Z",
      updatedAt: "2025-07-01T10:11:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "date",
};
export const datetimeCaseData: TestCaseData = {
  participants: [
    // Initial order: 2025-07-01T14:45, 2025-06-10T09:15, 2025-08-15T18:30
    {
      uuid: crypto.randomUUID(),
      email: "vince@example.com",
      createdAt: "2025-07-01T12:05:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          value: "2025-07-01T14:45:00Z",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "uma@example.com",
      createdAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          value: "2025-06-10T09:15:00Z",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "walter@example.com",
      createdAt: "2025-07-01T12:06:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          value: "2025-08-15T18:30:00Z",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: registrationDateTimeAttributeUuid,
      name: "Registration Datetime",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
      type: "datetime",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
      config: {
        options: null,
      },
    },
  ],
  attributeType: "datetime",
};
export const selectAndMultiselectTestCaseData: TestCaseData = {
  participants: [
    {
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      createdAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Male",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "Rust,Go",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "carol@example.com",
      createdAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Female",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "JavaScript,Python",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "eli@example.com",
      createdAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          value: "Other",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          value: "Go,Rust",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: genderAttributeUuid,
      name: "Gender",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "select",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
      config: {
        options: ["Male", "Female", "Other"],
      },
    },
    {
      uuid: skillsAttributeUuid,
      name: "Skills",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "multiSelect",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      config: {
        options: ["JavaScript", "Python", "Rust", "Go"],
      },
    },
  ],
};
export const editParticipantTestCaseData: TestCaseData = {
  participants: [
    {
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      createdAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "chewmanji",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
        {
          uuid: ageAttributeUuid,
          name: "Age",
          value: "42",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: ageAttributeUuid,
      name: "Age",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
      type: "number",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
      config: {
        options: null,
      },
    },
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "text",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      config: {
        options: null,
      },
    },
  ],
};
export const editParticipantDetailsTestCaseData: TestCaseData = {
  participants: [
    {
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      createdAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "chewmanji",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
        {
          uuid: ageAttributeUuid,
          name: "Age",
          value: "42",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
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
      uuid: crypto.randomUUID(),
      email: "bob@domain.com",
      createdAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Medium",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "anna@domain.com",
      createdAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Alpha",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "charlie@example.com",
      createdAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          value: "Zebra",
          createdAt: "2025-07-01T10:00:00Z",
          updatedAt: "2025-07-01T10:00:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      type: "text",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      config: {
        options: null,
      },
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
  dateCaseData,
];
