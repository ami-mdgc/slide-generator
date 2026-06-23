import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface Template05Data extends SlideTemplateData {
  title: string;
  sections: { heading: string; items: string[] }[];
  colors?: { accent: string; primary: string };
}

export default function Template05({ data }: { data: Template05Data }) {
  const accent = data.colors?.accent || '#c4ab46';

  return (
    <div className="bg-white relative size-full" data-name="template05">
      <SafeArea>
        <div className="absolute content-stretch flex items-center justify-center left-0 top-0" data-name="Heading1">
          <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[32px] items-start left-1/2 top-[125px] w-full">
          {data.sections.map((section, index) => (
            <div key={index} className="bg-[#f5f5f5] relative w-full" data-name="box03">
              <div className="content-stretch flex flex-col gap-[24px] items-start p-[40px] relative size-full">
                {section.heading && (
                  <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[36px]" style={{ color: accent }}>
                    {section.heading}
                  </p>
                )}
                <div className="content-stretch flex flex-col gap-[16px] items-start relative w-full">
                  {section.items.map((item, itemIndex) => (
                    item === '' ? (
                      <div key={itemIndex} className="h-[16px] w-full" />
                    ) : (
                      <p key={itemIndex} className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] not-italic relative text-[#18191e] text-[32px] w-full">
                        {item}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}
