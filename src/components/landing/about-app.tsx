/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image from "next/image";

import symbol from "@/assets/symbol.svg";

export function AboutApp() {
  return (
    <section id="o-aplikacji" className="bg-ternary">
      <div className="flex flex-col px-12 py-20 md:flex-row xl:py-40">
        <div className="w-full text-ternary-foreground md:w-1/2">
          <h3 className="text-xs font-bold uppercase md:text-xl">
            O aplikacji
          </h3>
          <h2 className="mb-5 text-2xl font-bold lg:text-4xl">
            Poznaj Eventownik
          </h2>
          <h4 className="font-bold">
            To platforma stworzoną z myślą o samorządach studenckich, kołach
            naukowych i innych organizacjach
            <br /> studenckich, która pomoże Ci w każdym aspekcie planowania i
            realizacji wydarzeń.
          </h4>
          <h4 className="my-3">
            Dlaczego <span className="font-bold">Eventownik?</span>
          </h4>
          <ul className="mb-10 md:mb-0">
            <li className="my-3 flex items-center">
              <Image src={symbol} alt="Symbol" width={15} height={15} />
              <span className="ml-2">Usprawnij planowanie</span>
            </li>
            <li className="my-3 flex items-center">
              <Image src={symbol} alt="Symbol" width={15} height={15} />
              <span className="ml-2">Zwiększ efektywność komunikacji</span>
            </li>
            <li className="my-3 flex items-center">
              <Image src={symbol} alt="Symbol" width={15} height={15} />
              <span className="ml-2">Poznaj swoich uczestników</span>
            </li>
            <li className="my-3 flex items-center">
              <Image src={symbol} alt="Symbol" width={15} height={15} />
              <span className="ml-2">Zorganizuj wydarzenie bez stresu</span>
            </li>
            <li className="my-3 flex items-center">
              <Image src={symbol} alt="Symbol" width={15} height={15} />
              <span className="ml-2">Oszczędzaj czas i pieniądze</span>
            </li>
          </ul>
        </div>
        <div className="h-[300px] w-full md:ml-16 md:w-1/2">
          {/* Here goes vision */}
        </div>
      </div>
    </section>
  );
}
