import Image from "next/image";

export function Partners() {
  return (
    <section
      id="partners"
      className="border-input z-10 flex w-full flex-col items-center border-y border-dashed bg-white dark:bg-[#101011]"
    >
      <div className="divide-input container flex flex-row items-center justify-between divide-x divide-dashed">
        <p className="px-16 py-8 text-2xl font-medium whitespace-nowrap uppercase">
          Zaufani partnerzy
        </p>
        <div className="flex w-full flex-row items-center justify-evenly gap-16 px-16 py-8">
          <Image
            src={"/assets/logo/pwr.png"}
            alt={"Politechnika Wrocławska"}
            width={300}
            height={300}
            className="max-h-12 w-auto"
          />
          <Image
            src={"/assets/logo/wit.png"}
            alt={"Wydział Informatyki i Telekomunikacji"}
            width={300}
            height={300}
            className="max-h-12 w-auto"
          />
          <Image
            src={"/assets/logo/seohost.png"}
            alt={"Seohost"}
            width={300}
            height={300}
            className="max-h-12 w-auto"
          />
          <Image
            src={"/assets/logo/best.svg"}
            alt={"Seohost"}
            width={300}
            height={300}
            className="max-h-12 w-auto"
          />
        </div>
      </div>
    </section>
  );
}
