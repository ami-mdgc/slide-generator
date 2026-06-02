import { SlideTemplateData } from "../../types/slide-template";

interface Template01Data extends SlideTemplateData {
  title: string;
  date?: string;
  summaryItems: {
    icon?: string;
    text: string;
  }[];
  metrics: {
    label: string;
    value: string;
    reference?: string;
  }[];
  colors?: { accent: string; primary: string };
}

function Container({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="content-stretch flex gap-[20px] h-[44px] items-center relative shrink-0 w-full" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="Icon">
        <div className="absolute inset-0" style={{ backgroundColor: accent }} />
      </div>
      <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[36px] whitespace-normal">
        {text}
      </p>
    </div>
  );
}

function MetricCard({ label, value, reference, accent }: { label: string; value: string; reference?: string; accent: string }) {
  return (
    <div className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[38px] items-center px-[40px] py-[48px] relative size-full">
          <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[16px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
            <p className="relative shrink-0 text-[36px]" style={{ color: accent }}>{label}</p>
            <p className="relative shrink-0 text-[#18191e] text-[72px]">{value}</p>
          </div>
          {reference && (
            <>
              <div className="h-0 relative shrink-0 w-full">
                <div className="absolute inset-[-1px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 480 1">
                    <line stroke="#18191e" x2="480" y1="0.5" y2="0.5" />
                  </svg>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[32px] whitespace-nowrap">
                {reference}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Template01({ data }: { data: Template01Data }) {
  const accent = data.colors?.accent || '#c4ab46';
  const primary = data.colors?.primary || '#5969a7';

  return (
    <div className="bg-white relative size-full" data-name="template01">
      <div className="absolute h-[77px] left-[96px] top-[96px] w-[920px]" data-name="Heading1">
        <p className="[word-break:break-word] absolute font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] left-0 not-italic text-[#18191e] text-[64px] top-0 whitespace-nowrap">
          {data.title}
        </p>
      </div>

      {/* Summary section */}
      <div className="absolute bg-[#f5f5f5] content-stretch flex flex-col gap-[32px] items-start left-[96px] p-[64px] top-[227px] w-[1728px]" data-name="summary">
        {data.summaryItems.map((item, index) => (
          <Container key={index} text={item.text} accent={accent} />
        ))}
      </div>

      {/* Metrics section */}
      <div className="-translate-x-1/2 absolute content-stretch flex gap-[24px] items-center left-1/2 top-[605px] w-[1728px]">
        {data.metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            reference={metric.reference}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}
