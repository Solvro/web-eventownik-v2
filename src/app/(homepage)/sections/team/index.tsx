import { Star } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { HighlightedMembers } from "./highlighted-members";
import { Member } from "./member";
import type { TeamMember } from "./team-member";

const team: TeamMember[] = [
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
    image:
      "https://cms.solvro.pl/assets/b9ac68b4-4f97-4cfa-a6f9-f24142050b35?key=member",
    url: "https://github.com/GOLDER303",
  },
  {
    name: "Maciej Talarczyk",
    roles: ["UI/UX Designer"],
    image: "/assets/landing/team/maciej-talarczyk.jpg",
    url: "https://github.com/muclx",
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
    image: "/assets/landing/team/marek-kocik.jpg",
    url: "https://github.com/huskyybtw",
  },
  {
    name: "Przemysław Bilski",
    roles: ["Backend Developer"],
    image:
      "https://cms.solvro.pl/assets/61d09895-a511-478c-aa5a-b144fa0d1278?key=member",
    url: "https://github.com/pb3dpb3d",
  },
  {
    name: "Kamil Ramocki",
    roles: ["Backend Developer"],
    image: "/assets/landing/team/kamil-ramocki.jpg",
    url: "https://github.com/kamilramocki",
  },
  {
    name: "Piotr Hirkyj",
    roles: ["Backend Developer"],
    image:
      "https://cms.solvro.pl/assets/fd7080a2-801d-40a9-9c65-f7fdfcfcd711?key=member",
    url: "https://github.com/ibtyog",
  },
  {
    name: "Karol Kosmala",
    roles: ["Backend Developer"],
    image: "https://avatars.githubusercontent.com/u/184450490?v=4",
    url: "https://github.com/K0smalka",
  },
  {
    name: "Bartosz Gotowski",
    roles: ["Frontend Techlead"],
    image:
      "https://cms.solvro.pl/assets/9d659db2-a12d-400e-9b45-87a89065a415?key=member",
    url: "https://github.com/rei-x",
  },
  {
    name: "Maciej Król",
    roles: ["Frontend Developer"],
    image:
      "https://cms.solvro.pl/assets/dfa1ac3b-c112-43e3-9004-ced678d91903?key=member",
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
    name: "Szymon Szymczewski",
    roles: ["Frontend Developer"],
    image:
      "https://cms.solvro.pl/assets/a172cf47-33cb-481a-ad3f-118363286b5c?key=member",
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
    image: "/assets/landing/team/bartek-plochocki.jpg",
    url: "https://github.com/Bartkooo",
  },
  {
    name: "Jeremiasz Lizak",
    roles: ["Devops Engineer"],
    image: "/assets/landing/team/jeremiasz-lizak.jpg",
    url: "https://github.com/JLizak",
  },
  {
    name: "Daria Totoszko",
    roles: ["Marketing Coordinator"],
    image: "/assets/landing/team/daria-totoszko.jpg",
    url: "https://github.com/DariaTotoszko",
  },
];

export async function Team() {
  const repositoryData = await fetch(
    "https://api.github.com/repos/Solvro/web-eventownik-v2",
  );
  const { stargazers_count } = (await repositoryData.json()) as {
    stargazers_count: number;
  };
  return (
    <div className="border-input container mb-16 flex flex-col items-center gap-8 rounded-b-4xl border-x border-b border-dashed bg-radial from-[#366CC8]/50 to-transparent px-8 pt-20 pb-12 sm:gap-24 sm:pb-20">
      <div className="flex flex-col items-center gap-8">
        <p className="w-min rounded-full border border-[#6583C8] px-5 py-2 text-xl font-medium whitespace-nowrap text-[#6583C8]">
          Solvro Team
        </p>
        <p className="text-center text-3xl font-medium">
          Eventownik powstał dzięki pracy{" "}
          <span className="text-[#6583C8]">{team.length} osób</span> z naszego
          zespołu.
          <br />
          Stworzyliśmy go, by ułatwić organizowanie wydarzeń i poznawanie ludzi.
        </p>
      </div>
      <div className="flex flex-col items-center gap-16 lg:gap-32">
        <HighlightedMembers team={team.slice(0, 5)} />
        <div className="flex flex-row flex-wrap items-center justify-center -space-x-4 gap-y-2">
          {team.slice(5).map((member) => (
            <Member key={member.name} member={member} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-12">
        <p className="text-center text-lg font-medium sm:text-2xl">
          Jeśli doceniasz naszą pracę nad Eventownikiem, zostaw gwiazdkę na
          GitHubie — to dla nas duża motywacja do dalszego rozwoju!
        </p>
        <a
          href="https://github.com/solvro/web-eventownik-v2"
          target="_blank"
          className="test-base flex flex-row items-center gap-4 rounded-full border-2 bg-transparent px-6 py-4 transition hover:bg-[#3672FD]/30 sm:text-xl"
          rel="noreferrer noopener"
        >
          <FaGithub size={20} />
          <p className="font-medium whitespace-nowrap">Walnij nam gwiazdkę</p>
          <div className="flex flex-row items-center gap-1">
            <Star fill="#3672FD" strokeWidth={0} size={20} />
            <p className="font-medium">{stargazers_count}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
