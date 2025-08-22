import Image from "next/image";

import { cn } from "@/lib/utils";

type role =
  | "Project Manager"
  | "Opiekun Projektu"
  | "Backend Techlead"
  | "Backend Developer"
  | "Frontend Techlead"
  | "Frontend Developer"
  | "UI/UX Designer"
  | "Devops Engineer"
  | "Marketing Coordinator";

interface Contributor {
  name: string;
  roles: role[];
  image?: string;
  url: string;
}

const contributors: Contributor[] = [
  {
    name: "Amelia Sroczyńska",
    roles: ["Project Manager"],
    image:
      "https://cms.solvro.pl/assets/8b57e57a-e701-4d9a-88e5-c254e9299fee?key=member",
    url: "https://www.linkedin.com/in/amelia-sroczy%C5%84ska-bb26ba347/",
  },
  {
    name: "Dawid Linek",
    roles: ["Opiekun Projektu"],
    image:
      "https://cms.solvro.pl/assets/77255d90-0ec0-4219-9c81-707cc50babc4?key=member",
    url: "https://github.com/dawidlinek",
  },
  {
    name: "Antoni Czaplicki",
    roles: ["Frontend Techlead"],
    image:
      "https://cms.solvro.pl/assets/e1424e35-9130-486b-9a5d-49771b6ea6eb?key=member",
    url: "https://github.com/Antoni-Czaplicki",
  },
  {
    name: "Szymon Stępień",
    roles: ["Backend Techlead"],
    url: "https://github.com/GOLDER303",
  },
  {
    name: "Bartosz Gotowski",
    roles: ["Frontend Techlead"],
    image:
      "https://cms.solvro.pl/assets/9d659db2-a12d-400e-9b45-87a89065a415?key=member",
    url: "https://github.com/rei-x",
  },
  {
    name: "Dawid Błaszczyk",
    roles: ["Frontend Developer", "Backend Developer"],
    image:
      "https://cms.solvro.pl/assets/70f2adcd-d1ba-4b4c-8eda-63d0b03ebfbd?key=member",
    url: "https://github.com/Skiperpol",
  },
  {
    name: "Marek Kocik",
    roles: ["Backend Developer"],
    url: "https://github.com/huskyybtw",
  },
  {
    name: "Przemysław Bilski",
    roles: ["Backend Developer"],
    url: "https://github.com/pb3dpb3d",
  },
  {
    name: "Kamil Ramocki",
    roles: ["Backend Developer"],
    image: "https://avatars.githubusercontent.com/u/93339268?v=4",
    url: "https://github.com/kamilramocki",
  },
  {
    name: "Piotr Hirkyj",
    roles: ["Backend Developer"],
    url: "https://github.com/ibtyog",
  },
  {
    name: "Karol Kosmala",
    roles: ["Backend Developer"],
    image: "https://avatars.githubusercontent.com/u/184450490?v=4",
    url: "https://github.com/K0smalka",
  },
  {
    name: "Maciej Król",
    roles: ["Frontend Developer"],
    url: "https://github.com/maciejkrol18",
  },
  {
    name: "Wojciech Kosmalski",
    roles: ["Frontend Developer"],
    image:
      "https://cms.solvro.pl/assets/225054ff-ac23-4e35-ae8e-455883fd1cf7?key=member",
    url: "https://github.com/chewmanji",
  },
  {
    name: "Maciej Malinowski",
    roles: ["Frontend Developer"],
    image:
      "https://cms.solvro.pl/assets/2508e1ff-596d-4bd1-bba9-6575f08ab8ce?key=member",
    url: "https://github.com/mejsiejdev",
  },
  {
    name: "Jakub Karbowski",
    roles: ["Frontend Developer"],
    url: "https://github.com/karbowskijakub",
  },
  {
    name: "Szymon Szymczewski",
    roles: ["Frontend Developer"],
    url: "https://github.com/Szymczek",
  },
  {
    name: "Tymon Jędryczka",
    roles: ["Frontend Developer"],
    image:
      "https://cms.solvro.pl/assets/407e5e94-3714-4082-90c6-3fc352aef796?key=member",
    url: "https://github.com/jedryczkatymon",
  },
  {
    name: "Patryk Kuzdrowski",
    roles: ["Frontend Developer"],
    image: "https://avatars.githubusercontent.com/u/81564272?v=4",
    url: "https://github.com/Kuzdra24",
  },
  {
    name: "Maciej Talarczyk",
    roles: ["UI/UX Designer"],
    image:
      "https://cms.solvro.pl/assets/527f6108-e95b-4d64-b725-1b054b949d9f?key=member",
    url: "https://github.com/muclx",
  },
  {
    name: "Marcin Blicharski",
    roles: ["UI/UX Designer"],
    image:
      "https://cms.solvro.pl/assets/a1feda99-2541-40d9-9689-36ea06cf99c7?key=member",
    url: "https://github.com/MBlich",
  },
  {
    name: "Karol Koenig",
    roles: ["Devops Engineer"],
    image:
      "https://cms.solvro.pl/assets/87990588-6444-48b3-8b87-6b3a8483ba19?key=member",
    url: "https://github.com/kaykoe",
  },
  {
    name: "Bartek Płochocki",
    roles: ["Devops Engineer"],
    url: "https://github.com/Bartkooo",
  },
  {
    name: "Jeremiasz Lizak",
    roles: ["Devops Engineer"],
    url: "https://github.com/JLizak",
  },
  {
    name: "Daria Totoszko",
    roles: ["Marketing Coordinator"],
    url: "https://github.com/DariaTotoszko",
  },
];

function HighlightedContributor({
  contributor,
  className,
}: {
  contributor: Contributor;
  className?: string;
}) {
  return (
    <a
      title={contributor.name}
      href={contributor.url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <Image
        src={
          typeof contributor.image === "string"
            ? contributor.image
            : "/person.webp"
        }
        alt={contributor.name}
        width={500}
        height={500}
        className={cn("size-72 rounded-4xl drop-shadow-2xl", className)}
      />
    </a>
  );
}

export function Contributors() {
  return (
    <div className="container flex flex-col items-center gap-32">
      <div className="flex flex-col items-center gap-8">
        <p className="w-min rounded-full border border-[#6583C8] px-5 py-2 text-xl font-medium whitespace-nowrap text-[#6583C8]">
          Solvro Team
        </p>
        <p className="text-center text-3xl font-medium">
          Eventownik powstał dzięki pracy{" "}
          <span className="text-[#6583C8]">{contributors.length} osób</span> z
          naszego zespołu.
          <br />
          Stworzyliśmy go, by ułatwić organizowanie wydarzeń i poznawanie ludzi.
        </p>
      </div>
      <div className="flex flex-col items-center gap-32">
        <div className="flex flex-row -space-x-16">
          <HighlightedContributor
            contributor={contributors[3]}
            className="translate-y-16 rotate-6"
          />
          <HighlightedContributor
            contributor={contributors[1]}
            className="z-10 translate-y-4 -rotate-6"
          />
          <HighlightedContributor
            contributor={contributors[0]}
            className="z-20 rotate-12"
          />
          <HighlightedContributor
            contributor={contributors[2]}
            className="z-10 translate-y-4 rotate-6"
          />
          <HighlightedContributor
            contributor={contributors[4]}
            className="translate-y-16 -rotate-6"
          />
        </div>
        <div className="flex flex-row -space-x-4">
          {contributors.slice(5).map((contributor) => (
            <a
              title={contributor.name}
              href={contributor.url}
              key={contributor.name}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Image
                src={
                  typeof contributor.image === "string"
                    ? contributor.image
                    : "/person.webp"
                }
                alt={contributor.name}
                width={500}
                height={500}
                className="size-20 rounded-full"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
