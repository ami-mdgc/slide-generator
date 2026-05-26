import { SlideTemplateData } from "../../types/slide-template";

interface Template02Data extends SlideTemplateData {
  title: string;
  sections: {
    heading: string;
    subheading: string;
    items: string[];
  }[];
  colors?: { accent: string; primary: string };
}

export default function Template02({ data }: { data: Template02Data }) {
  const accent = data.colors?.accent || '#c4ab46';

  return (
    <div className="bg-white relative size-full" data-name="template02">
      <div className="absolute content-stretch flex items-center justify-center left-[96px] top-[88px]" data-name="Heading1">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
          {data.title}
        </p>
      </div>

      <div className="-translate-x-1/2 absolute content-stretch flex gap-[48px] h-[765px] items-center left-1/2 top-[219px] w-[1728px]">
        {data.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-[#f5f5f5] flex-[1_0_0] h-full min-w-px relative" data-name="box">
            <div className="content-stretch flex flex-col gap-[32px] items-start px-[40px] py-[48px] relative size-full">
              <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[24px] items-start leading-[normal] not-italic relative shrink-0 w-full whitespace-nowrap">
                <p className="relative shrink-0 text-[48px]" style={{ color: accent }}>{section.heading}</p>
                <p className="relative shrink-0 text-[#18191e] text-[36px]">{section.subheading}</p>
              </div>

              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
                {section.items.map((item, itemIndex) => (
                  <p key={itemIndex} className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#18191e] text-[32px] w-full">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
