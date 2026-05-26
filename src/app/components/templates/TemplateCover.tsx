import { SlideTemplateData } from "../../types/slide-template";

interface TemplateCoverData extends SlideTemplateData {
  title: string;
  subtitle?: string;
  date?: string;
}

export default function TemplateCover({ data }: { data: TemplateCoverData }) {
  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="templateCover">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-[#5969a7]" />

      {/* Top decorative block */}
      <div className="absolute top-0 right-0 w-[640px] h-[420px] bg-[#f5f5f5]" />

      {/* Inner accent square */}
      <div className="absolute top-[64px] right-[64px] w-[160px] h-[160px] bg-[#5969a7] opacity-10" />

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col justify-center pl-[96px] pr-[480px]">
        {data.subtitle && (
          <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] text-[#c4ab46] text-[36px] leading-normal mb-[40px] not-italic">
            {data.subtitle}
          </p>
        )}
        <h1 className="font-['Gen_Interface_JP_Display:Medium',sans-serif] text-[#18191e] text-[88px] leading-[1.2] mb-[56px] not-italic [word-break:break-word]">
          {data.title}
        </h1>
        {data.date && (
          <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] text-[#18191e] text-[32px] leading-normal not-italic opacity-60">
            {data.date}
          </p>
        )}
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-[80px] left-[96px] right-[96px] h-[1px] bg-[#18191e] opacity-10" />
    </div>
  );
}
