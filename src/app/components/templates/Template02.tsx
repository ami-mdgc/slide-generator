import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface Template02Data extends SlideTemplateData {
  title: string;
  sections: { heading: string; subheading: string; items: string[] }[];
  colors?: { accent: string; primary: string };
}

export default function Template02({ data }: { data: Template02Data }) {
  const accent = data.colors?.accent || '#c4ab46';
  const is2x2 = data.sections.length === 4;

  return (
    <div className="bg-white relative size-full" data-name="template02">
      <SafeArea>
        <div className="absolute content-stretch flex items-center justify-center left-0 top-0" data-name="Heading1">
          <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {is2x2 ? (
          <div
            className="-translate-x-1/2 absolute left-1/2 top-[125px] w-full"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 48, height: 763 }}
          >
            {data.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-[#f5f5f5] relative min-w-0" data-name="box">
                <div className="content-stretch flex flex-col gap-[20px] items-start px-[36px] py-[36px] relative size-full">
                  <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 w-full whitespace-nowrap">
                    <p className="relative shrink-0 text-[28px] font-['Gen_Interface_JP_Display:SemiBold',sans-serif]" style={{ color: accent }}>{section.heading}</p>
                    <p className="relative shrink-0 text-[#18191e] text-[30px]">{section.subheading}</p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="ul">
                    {section.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#18191e] text-[24px] w-full">
                        - {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="-translate-x-1/2 absolute content-stretch flex gap-[48px] h-[763px] items-center left-1/2 top-[125px] w-full">
            {data.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-[#f5f5f5] flex-[1_0_0] h-full min-w-px relative" data-name="box">
                <div className="content-stretch flex flex-col gap-[32px] items-start px-[40px] py-[48px] relative size-full">
                  <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[24px] items-start leading-[normal] not-italic relative shrink-0 w-full whitespace-nowrap">
                    <p className="relative shrink-0 text-[32px] font-['Gen_Interface_JP_Display:SemiBold',sans-serif]" style={{ color: accent }}>{section.heading}</p>
                    <p className="relative shrink-0 text-[#18191e] text-[36px]">{section.subheading}</p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
                    {section.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#18191e] text-[28px] w-full">
                        - {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SafeArea>
    </div>
  );
}
