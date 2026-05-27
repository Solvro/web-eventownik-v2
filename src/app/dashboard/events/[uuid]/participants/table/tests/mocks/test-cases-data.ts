import type {
  Attribute,
  AttributeType,
  FormAttribute,
} from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export interface TestCaseData {
  participants: Participant[];
  // TODO(refactor,multiselect-blocks): Adjust the type here after cleaning up `@/types/attributes.ts`
  attributes: Omit<Attribute, keyof FormAttribute>[];
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
      email: "bob@domain.com", // email domain changed for filtering tests
      slug: "bob",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Medium", // Middle value
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "anna@domain.com", // email domain changed for filtering tests
      slug: "anna",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Alpha", // First alphabetically
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "charlie@example.com",
      slug: "charlie",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Zebra", // Last alphabetically
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      slug: "nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      options: null,
      type: "text",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
    },
  ] as Attribute[],
  attributeType: "text",
  emails: [
    {
      uuid: crypto.randomUUID(),
      eventUuid: "1ac2bfb4-61ae-4cab-9d3d-d5e989e3a458",
      name: "Welcome Email - New Registration",
      trigger: "participant_registered",
      triggerValue: null,
      triggerValue2: null,
      order: 0,
      createdAt: "2024-12-15T09:30:00.000Z",
      updatedAt: "2025-01-20T14:22:15.000Z",
      meta: {
        failedCount: "3",
        pendingCount: "12",
        sentCount: "847",
      },
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
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Male",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "carol@example.com",
      slug: "carol",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Female",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "eli@example.com",
      slug: "eli",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Other",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: genderAttributeUuid,
      name: "Gender",
      slug: "gender",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "frank@example.com",
      slug: "frank",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          slug: "contact-email",
          value: "middle@example.com",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "grace@example.com",
      slug: "grace",
      createdAt: "2025-07-01T10:06:00Z",
      updatedAt: "2025-07-01T10:06:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          slug: "contact-email",
          value: "auser@example.com",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "henry@example.com",
      slug: "henry",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          uuid: contactEmailAttributeUuid,
          name: "Contact Email",
          slug: "contact-email",
          value: "zuser@example.com",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: contactEmailAttributeUuid,
      name: "Contact Email",
      slug: "contact-email",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "ivy@example.com",
      slug: "ivy",
      createdAt: "2025-07-01T10:08:00Z",
      updatedAt: "2025-07-01T10:08:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          slug: "about-me",
          value: "Love hiking and running marathons.",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "hank@example.com",
      slug: "hank",
      createdAt: "2025-07-01T10:07:00Z",
      updatedAt: "2025-07-01T10:07:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          slug: "about-me",
          value: "Software engineer and cat lover.",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "jack@example.com",
      slug: "jack",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          uuid: aboutMeAttributeUuid,
          name: "About Me",
          slug: "about-me",
          value: "Creative writer and book enthusiast.",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: aboutMeAttributeUuid,
      name: "About Me",
      slug: "about-me",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "aren@example.com",
      slug: "aren",
      createdAt: "2025-07-01T10:10:00Z",
      updatedAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "Rust,Go",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "karen@example.com",
      slug: "karen",
      createdAt: "2025-07-01T10:10:00Z",
      updatedAt: "2025-07-01T10:10:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "Go,Rust",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "john@example.com",
      slug: "john",
      createdAt: "2025-07-01T10:09:00Z",
      updatedAt: "2025-07-01T10:09:00Z",
      attributes: [
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "JavaScript,Python",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: skillsAttributeUuid,
      name: "Skills",
      slug: "skills",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "mila@example.com",
      slug: "mila",
      createdAt: "2025-07-01T10:12:00Z",
      updatedAt: "2025-07-01T10:12:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#0000ff", // blue
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "leo@example.com",
      slug: "leo",
      createdAt: "2025-07-01T10:11:00Z",
      updatedAt: "2025-07-01T10:11:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#ff0000", // red
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "nina@example.com",
      slug: "nina",
      createdAt: "2025-07-01T10:13:00Z",
      updatedAt: "2025-07-01T10:13:00Z",
      attributes: [
        {
          uuid: favoriteColorAttributeUuid,
          name: "Favorite Color",
          slug: "favorite-color",
          value: "#00ff00", // green
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: favoriteColorAttributeUuid,
      name: "Favorite Color",
      slug: "favorite-color",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "peter@example.com",
      slug: "peter",
      createdAt: "2025-07-01T11:02:00Z",
      updatedAt: "2025-07-01T11:02:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          slug: "age",
          value: "35",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "noah@example.com",
      slug: "noah",
      createdAt: "2025-07-01T11:00:00Z",
      updatedAt: "2025-07-01T11:00:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          slug: "age",
          value: "22",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "olivia@example.com",
      slug: "olivia",
      createdAt: "2025-07-01T11:01:00Z",
      updatedAt: "2025-07-01T11:01:00Z",
      attributes: [
        {
          uuid: ageAttributeUuid,
          name: "Age",
          slug: "age",
          value: "45",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: ageAttributeUuid,
      name: "Age",
      slug: "age",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "bella@example.com",
      slug: "bella",
      createdAt: "2025-07-01T14:02:00Z",
      updatedAt: "2025-07-01T14:02:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          slug: "phone-number",
          value: "+49-151-12345678",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "zoe@example.com",
      slug: "zoe",
      createdAt: "2025-07-01T14:00:00Z",
      updatedAt: "2025-07-01T14:00:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          slug: "phone-number",
          value: "+1-202-555-0101",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "alex@example.com",
      slug: "alex",
      createdAt: "2025-07-01T14:01:00Z",
      updatedAt: "2025-07-01T14:01:00Z",
      attributes: [
        {
          uuid: phoneNumberAttributeUuid,
          name: "Phone Number",
          slug: "phone-number",
          value: "+44-7700-900123",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: phoneNumberAttributeUuid,
      name: "Phone Number",
      slug: "phone-number",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "will@example.com",
      slug: "will",
      createdAt: "2025-07-01T13:00:00Z",
      updatedAt: "2025-07-01T13:00:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          slug: "subscribed",
          value: "true",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "xena@example.com",
      slug: "xena",
      createdAt: "2025-07-01T13:01:00Z",
      updatedAt: "2025-07-01T13:01:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          slug: "subscribed",
          value: "false",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "yuri@example.com",
      slug: "yuri",
      createdAt: "2025-07-01T13:02:00Z",
      updatedAt: "2025-07-01T13:02:00Z",
      attributes: [
        {
          uuid: subscribedAttributeUuid,
          name: "Subscribed",
          slug: "subscribed",
          value: "true",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: subscribedAttributeUuid,
      name: "Subscribed",
      slug: "subscribed",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "tom@example.com",
      slug: "tom",
      createdAt: "2025-07-01T12:03:00Z",
      updatedAt: "2025-07-01T12:03:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "17:15:00",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "sara@example.com",
      slug: "sara",
      createdAt: "2025-07-01T12:02:00Z",
      updatedAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "08:30:00",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "una@example.com",
      slug: "una",
      createdAt: "2025-07-01T12:04:00Z",
      updatedAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          uuid: preferredTimeAttributeUuid,
          name: "Preferred Time",
          slug: "preferred-time",
          value: "12:45:00",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: preferredTimeAttributeUuid,
      name: "Preferred Time",
      slug: "preferred-time",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "ryan@example.com",
      slug: "ryan",
      createdAt: "2025-07-01T12:01:00Z",
      updatedAt: "2025-07-01T12:01:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          slug: "birth-date",
          value: "1990-05-14",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "quinn@example.com",
      slug: "quinn",
      createdAt: "2025-07-01T12:00:00Z",
      updatedAt: "2025-07-01T12:00:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          slug: "birth-date",
          value: "1985-11-20",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "sophie@example.com",
      slug: "sophie",
      createdAt: "2025-07-01T12:02:00Z",
      updatedAt: "2025-07-01T12:02:00Z",
      attributes: [
        {
          uuid: birthdayAttributeUuid,
          name: "Birth Date",
          slug: "birth-date",
          value: "1995-03-08",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: birthdayAttributeUuid,
      name: "Birth Date",
      slug: "birth-date",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "vince@example.com",
      slug: "vince",
      createdAt: "2025-07-01T12:05:00Z",
      updatedAt: "2025-07-01T12:05:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-07-01T14:45:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "uma@example.com",
      slug: "uma",
      createdAt: "2025-07-01T12:04:00Z",
      updatedAt: "2025-07-01T12:04:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-06-10T09:15:00Z",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "walter@example.com",
      slug: "walter",
      createdAt: "2025-07-01T12:06:00Z",
      updatedAt: "2025-07-01T12:06:00Z",
      attributes: [
        {
          uuid: registrationDateTimeAttributeUuid,
          name: "Registration Datetime",
          slug: "registration-datetime",
          value: "2025-08-15T18:30:00Z",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: registrationDateTimeAttributeUuid,
      name: "Registration Datetime",
      slug: "registration-datetime",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Male",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "Rust,Go",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "carol@example.com",
      slug: "carol",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Female",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "JavaScript,Python",
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "eli@example.com",
      slug: "eli",
      createdAt: "2025-07-01T10:04:00Z",
      updatedAt: "2025-07-01T10:04:00Z",
      attributes: [
        {
          uuid: genderAttributeUuid,
          name: "Gender",
          slug: "gender",
          value: "Other",
        },
        {
          uuid: skillsAttributeUuid,
          name: "Skills",
          slug: "skills",
          value: "Go,Rust",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: genderAttributeUuid,
      name: "Gender",
      slug: "gender",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
      options: ["Male", "Female", "Other"],
      type: "select",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
    },
    {
      uuid: skillsAttributeUuid,
      name: "Skills",
      slug: "skills",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "chewmanji",
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: ageAttributeUuid,
      name: "Age",
      slug: "age",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: false,
      order: 0,
      options: null,
      type: "number",
      createdAt: "2025-07-01T10:05:00Z",
      updatedAt: "2025-07-01T10:05:00Z",
    },
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      slug: "nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
      uuid: crypto.randomUUID(),
      email: "dan@example.com",
      slug: "dan",
      createdAt: "2025-07-01T10:03:00Z",
      updatedAt: "2025-07-01T10:03:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "chewmanji",
        },
        {
          uuid: ageAttributeUuid,
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
      uuid: crypto.randomUUID(),
      email: "bob@domain.com",
      slug: "bob",
      createdAt: "2025-07-01T10:01:00Z",
      updatedAt: "2025-07-01T10:01:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Medium", // Middle value
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "anna@domain.com",
      slug: "anna",
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-07-01T10:00:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Alpha", // First alphabetically
        },
      ],
    },
    {
      uuid: crypto.randomUUID(),
      email: "charlie@example.com",
      slug: "charlie",
      createdAt: "2025-07-01T10:02:00Z",
      updatedAt: "2025-07-01T10:02:00Z",
      attributes: [
        {
          uuid: nicknameAttributeUuid,
          name: "Nickname",
          slug: "nickname",
          value: "Zebra", // Last alphabetically
        },
      ],
    },
  ],
  attributes: [
    {
      uuid: nicknameAttributeUuid,
      name: "Nickname",
      slug: "nickname",
      eventUuid: "e171f4c9-e2be-47fb-831c-ab783c2bf1ff",
      showInList: true,
      order: 0,
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
