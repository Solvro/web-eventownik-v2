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

export async function Team() {
  const repositoryData = await fetch(
    "https://api.github.com/repos/Solvro/web-eventownik-v2",
  );
  const { stargazers_count } = (await repositoryData.json()) as {
    stargazers_count: number;
  };
  return (
    <div className="border-input container mb-16 flex flex-col items-center gap-24 rounded-b-4xl border-x border-b border-dashed bg-radial from-[#366CC8]/50 to-transparent px-8 py-20">
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
      <div className="flex flex-col items-center gap-32">
        <HighlightedMembers team={team.slice(0, 5)} />
        <div className="flex flex-row flex-wrap justify-center space-y-4 -space-x-4">
          {team.slice(5).map((member, index) => (
            <Member key={index} member={member} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-12">
        <p className="text-center text-2xl font-medium">
          Jeśli doceniasz naszą pracę nad Eventownikiem, zostaw gwiazdkę na
          GitHubie — to dla nas duża motywacja do dalszego rozwoju!
        </p>
        <a
          href="https://github.com/solvro/web-eventownik-v2"
          target="_blank"
          className="flex flex-row items-center gap-4 rounded-full border-2 bg-transparent px-6 py-4 transition hover:bg-[#3672FD]/30"
          rel="noreferrer noopener"
        >
          <FaGithub size={20} />
          <p className="text-xl font-medium">Walnij nam gwiazdkę</p>
          <div className="flex flex-row items-center gap-1">
            <Star fill="#3672FD" strokeWidth={0} size={20} />
            <p className="text-xl font-medium">{stargazers_count}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
