import Image from "next/image";

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export async function Contributors() {
  const data = await fetch(
    "https://api.github.com/repos/Solvro/web-eventownik-v2/contributors",
  );
  const contributors = ((await data.json()) as Contributor[]).filter(
    (contributor) => contributor.type === "User",
  );
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
          <Image
            key={contributors[3].login}
            src={contributors[3].avatar_url}
            alt={contributors[3].login}
            width={500}
            height={500}
            className="size-72 translate-y-16 rotate-6 rounded-4xl drop-shadow-2xl"
          />
          <Image
            key={contributors[1].login}
            src={contributors[1].avatar_url}
            alt={contributors[1].login}
            width={500}
            height={500}
            className="z-10 size-72 translate-y-4 -rotate-6 rounded-4xl drop-shadow-2xl"
          />
          <Image
            key={contributors[0].login}
            src={contributors[0].avatar_url}
            alt={contributors[0].login}
            width={500}
            height={500}
            className="z-20 size-72 rotate-12 rounded-4xl drop-shadow-2xl"
          />
          <Image
            key={contributors[2].login}
            src={contributors[2].avatar_url}
            alt={contributors[2].login}
            width={500}
            height={500}
            className="z-10 size-72 translate-y-4 rotate-6 rounded-4xl drop-shadow-2xl"
          />
          <Image
            key={contributors[4].login}
            src={contributors[4].avatar_url}
            alt={contributors[4].login}
            width={500}
            height={500}
            className="size-72 translate-y-16 -rotate-6 rounded-4xl drop-shadow-2xl"
          />
        </div>
        <div className="flex flex-row -space-x-4">
          {contributors.slice(5).map((contributor) => (
            <Image
              key={contributor.login}
              src={contributor.avatar_url}
              alt={contributor.login}
              width={500}
              height={500}
              className="size-20 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
