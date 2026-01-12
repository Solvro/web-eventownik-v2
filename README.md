# <img src="https://github.com/Solvro/web-testownik/blob/main/public/favicon/192x192.png?raw=true" width="24"> Eventownik Solvro – Frontend

<div align="center">

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Tailwind](https://img.shields.io/badge/tailwind-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Motto](https://img.shields.io/badge/%23Wytrzyma-%23e4efff?style=for-the-badge&logo=Motto&logoColor=white)

**Aplikacja do organizacji wydarzeń dla studentów Politechniki Wrocławskiej**

[Odwiedź aplikację](https://eventownik.solvro.pl) • [Dokumentacja](https://docs.solvro.pl/projects/eventownik/handbook/) • [Backend V2](https://github.com/Solvro/backend-eventownik-v2) • [Backend V3](https://github.com/Solvro/backend-eventownik-v3)

</div>

---

## O projekcie

**Eventownik Solvro** to aplikacja webowa tworzona przez [KN Solvro](https://github.com/Solvro), której celem jest ułatwienie organizacji wydarzeń studenckich na Politechnice Wrocławskiej.

Aplikacja umożliwia tworzenie i konfigurację wydarzeń, zarządzanie uczestnikami, formularzami oraz komunikacją mailową, tworząc kompletne rozwiązanie dla organizatorów wydarzeń.

## Funkcjonalności

- Tworzenie i konfiguracja wydarzeń
- Dodawanie współorganizatorów
- Definiowanie atrybutów uczestników
- Zarządzanie uczestnikami
- Tworzenie formularzy rejestracyjnych
- Tworzenie szablonów maili
- Wysyłka maili (spersonalizowanych oraz wyzwalanych)

## Uruchomienie lokalne

### Wymagania

- [Node.js](https://nodejs.org/) (zalecana wersja LTS)
- npm (dostarczany z Node.js)

### Instalacja

1. **Sklonuj repozytorium**

   ```bash
   git clone https://github.com/Solvro/web-eventownik-v2.git
   cd web-eventownik-v2
   ```

2. **Zainstaluj zależności**

   ```bash
   npm install
   ```

3. **Uruchom serwer deweloperski**

   ```bash
   npm run dev
   ```

4. **Otwórz przeglądarkę** i przejdź do `http://localhost:3000`

## Dostępne skrypty

| Komenda                | Opis                                      |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Uruchamia serwer deweloperski (Turbopack) |
| `npm run build`        | Buduje aplikację do produkcji             |
| `npm run start`        | Uruchamia zbudowaną aplikację             |
| `npm run lint`         | Sprawdza kod za pomocą ESLint             |
| `npm run format`       | Formatuje kod za pomocą Prettier          |
| `npm run format:check` | Sprawdza formatowanie kodu                |
| `npm run typecheck`    | Sprawdza typy TypeScript                  |
| `npm run test`         | Uruchamia testy (Vitest)                  |
| `npm run test:ui`      | Uruchamia UI Vitest                       |

## Stack technologiczny

- **Framework:** [Next.js](https://nextjs.org/) (v16) + [React](https://react.dev/) (v19)
- **Język:** [TypeScript](https://www.typescriptlang.org/)
- **Stylowanie:** [Tailwind CSS](https://tailwindcss.com/)
- **Komponenty UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Ikony:** [Lucide React](https://lucide.dev/)
- **Edytor WYSIWYG:** [Tiptap](https://tiptap.dev/)
- **Global state:** [Jotai](https://jotai.org/)
- **Walidacja:** [Zod](https://zod.dev/)
- **Animacje:** [Motion](https://motion.dev/)
- **Testy :** [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

## Kontrybucja

Chcesz pomóc w rozwoju Eventownika? Super.

1. Sforkuj repozytorium (jeśli nie jesteś w zespole)
2. Stwórz branch dla swojej zmiany
3. Commituj zmiany zgodnie z Conventional Commits
4. Zpushuj branch
5. Otwórz Pull Request
6. Zlinkuj issues, które chcesz rozwiązać (jeśli takie są)

### Format commitów

Stosujemy standard **Conventional Commits**.

```bash
<type>(opcjonalny scope): opis w czasie teraźniejszym
```

**Przykłady**

```
feat(events): add event duplication
fix(forms): correct validation edge case
docs: update readme
refactor(mail): simplify editor logic
test(events): add missing unit tests
```

## Zgłaszanie problemów

- Problemy dotyczące **frontendu** zgłaszaj w tym repozytorium.
- Problemy dotyczące **backendu** (API, logika serwera, baza danych) zgłaszaj w repozytorium backendu:
  [https://github.com/Solvro/backend-eventownik-v2](https://github.com/Solvro/backend-eventownik-v2)

## Aktualny zespół

- [Maciej Król](https://github.com/maciejkrol18) – **Frontend Tech Lead**
- [Antoni Czaplicki](https://github.com/Antoni-Czaplicki) – Frontend Developer
- [Bohdan Koshkin](https://github.com/ShadowCatP) – Frontend Developer
- [Bohdan Moshenets](https://github.com/moshenetsb) – Frontend Developer
- [Maciej Malinowski](https://github.com/mejsiejdev) – Frontend Developer
- [Maksymilian Tarasiuk](https://github.com/maks1u) - Frontend Developer
- [Wincenty Wensker](https://github.com/kitkacy) - UI/UX Designer
- [Maciej Talarczyk](https://github.com/muclx) – UI/UX Designer

## Kontakt

- **Email:** [kn.solvro@pwr.edu.pl](mailto:kn.solvro@pwr.edu.pl)
- **Organizacja:** [KN Solvro](https://github.com/Solvro)
- **Strona:** [https://solvro.pwr.edu.pl](https://solvro.pwr.edu.pl)

---

<div align="center">

Stworzone przez [KN Solvro](https://github.com/Solvro) dla studentów Politechniki Wrocławskiej

</div>
