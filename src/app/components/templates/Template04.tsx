import { SlideTemplateData } from "../../types/slide-template";

interface Template04Data extends SlideTemplateData {
  title: string;
  initiatives: {
    smallHeading: string;
    heading: string;
    items: {
      label: string;
      text: string;
    }[];
  }[];
  colors?: { accent: string; primary: string };
}

export default function Template04({ data }: { data: Template04Data }) {
  const accent = data.colors?.accent || '#c4ab46';

  return (
    <div className="bg-white relative size-full" data-name="template04">
      <div className="absolute content-stretch flex items-center justify-center left-[96px] top-[88px]" data-name="Heading1">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
          {data.title}
        </p>
      </div>

      <div className="-translate-x-1/2 absolute content-stretch flex gap-[48px] h-[765px] items-center left-1/2 top-[219px] w-[1728px]">
        {data.initiatives.map((initiative, initIndex) => (
          <div key={initIndex} className="bg-[#f5f5f5] flex-[1_0_0] h-full min-w-px relative" data-name="box02">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[32px] items-start not-italic p-[40px] relative size-full">
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full whitespace-nowrap">
                <p className="font-['Gen_Interface_JP_Display:Bold',sans-serif] leading-[1.5] relative shrink-0 text-[#18191e] text-[24px]">
                  {initiative.smallHeading}
                </p>
                <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] relative shrink-0 text-[36px]" style={{ color: accent }}>
                  {initiative.heading}
                </p>
              </div>

              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 text-[#18191e] w-full" data-name="ul">
                {initiative.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="li">
                    <p className="font-['Gen_Interface_JP_Display:Bold',sans-serif] leading-[1.5] relative shrink-0 text-[28px] whitespace-nowrap">
                      {item.label}
                    </p>
                    <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.5] relative text-[32px] w-full">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
