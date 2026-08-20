export interface HighlightedEvent {
  name: string;
  year: number;
  description?: string;
  image: {
    src: string;
    alt: string;
  };
}

export const highlightedEvents: HighlightedEvent[] = [
  {
    name: "RAJD „SHREKSPEDYCJA: WELCOME TO BAGNO”",
    description:
      "Organizatorom z WRSS W6, W8 i W12 został pilotażowo udostępniony Eventownik, aby przetestowali jego funkcjonalność i sprawdzili jak skutecznie może usprawnić zarządzanie dużym wydarzeniem.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/shrekspedycja.jpg",
      alt: "RAJD „SHREKSPEDYCJA: WELCOME TO BAGNO”",
    },
  },
  {
    name: 'Rejs "W8 na Fali"',
    description:
      "Po sukcesie Eventownika na Rajdzie, WuZetka postanowiła ponownie skorzystać z aplikacji przy organizacji ich kolejnego wydarzenia - Rejsu 2025.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/rejs-w8.jpg",
      alt: 'Rejs "W8 na Fali"',
    },
  },
  {
    name: "Wyjazd do Graz w ramach Unite!",
    description:
      "Studenci z naszego Koła Solvro wzięli udział w wymianie do Graz w ramach programu Unite!  Podczas organizacji wyjazdu korzystali z Eventownika, który usprawnił jego planowanie oraz realizację od początku do końca.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/wyjazd-graz.jpg",
      alt: "Wyjazd do Graz w ramach Unite!",
    },
  },
];
