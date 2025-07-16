export function AboutApp() {
  return (
    <section className="bg-ternary">
      <div className="flex flex-col px-12 py-20 md:flex-row xl:py-44">
        <div className="text-ternary-foreground w-full md:w-1/2">
          <h3 className="text-xs font-bold uppercase md:text-xl">
            O aplikacji
          </h3>
          <h2 className="mb-5 text-2xl font-bold lg:text-4xl">
            Poznaj Eventownik
          </h2>
          <h4 className="font-bold">
            To platforma stworzoną z myślą o samorządach studenckich, kołach
            naukowych i innych organizacjach studenckich, która pomoże Ci w
            każdym aspekcie planowania i realizacji wydarzeń.
          </h4>
          <h4 className="my-3">
            Dlaczego <b>Eventownik?</b>
          </h4>
          <ul className="mb-10 flex list-inside list-disc flex-col gap-2 outline-black md:mb-0">
            <li>Usprawnij planowanie</li>
            <li>Zwiększ efektywność komunikacji</li>
            <li>Poznaj swoich uczestników</li>
            <li>Zorganizuj wydarzenie bez stresu</li>
            <li>Oszczędzaj czas i pieniądze</li>
          </ul>
        </div>
        <div className="h-[300px] w-full md:ml-16 md:w-1/2">
          {/* Here goes vision */}
        </div>
      </div>
    </section>
  );
}
