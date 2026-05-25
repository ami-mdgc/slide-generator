import { SlideTemplateData } from "../../types/slide-template";

interface Template05Data extends SlideTemplateData {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    text: string;
  }[];
}

export default function Template05({ data }: { data: Template05Data }) {
  return (
    <div className="bg-white relative size-full" data-name="template05">
      <div className="absolute content-stretch flex items-center justify-center left-[96px] top-[88px]" data-name="Heading1">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
          {data.title}
        </p>
      </div>

      {data.subtitle && (
        <p className="[word-break:break-word] absolute font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] left-[96px] not-italic text-[#18191e] text-[48px] top-[224px] whitespace-nowrap">
          {data.subtitle}
        </p>
      )}

      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[48px] items-start justify-center left-1/2 top-[360px] w-[1728px]">
        {data.sections.map((section, index) => (
          <div key={index} className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="box03">
            <div className="content-stretch flex flex-col items-start p-[40px] relative size-full">
              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 text-[#18191e] w-full" data-name="li">
                  <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] relative shrink-0 text-[36px] whitespace-nowrap">
                    {section.heading}
                  </p>
                  <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] min-w-full relative shrink-0 text-[32px]">
                    {section.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
