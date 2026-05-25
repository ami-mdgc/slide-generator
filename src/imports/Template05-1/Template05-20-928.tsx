function Ul() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 text-[#18191e] w-full" data-name="li">
        <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] relative shrink-0 text-[36px] whitespace-nowrap">背景</p>
        <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[0] min-w-full relative shrink-0 text-[0px] w-[min-content]">
          <span className="leading-[1.5] text-[32px]">テキスト</span>
          <span className="leading-[1.5] text-[32px]">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</span>
        </p>
      </div>
    </div>
  );
}

function Ul1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 text-[#18191e] w-full" data-name="li">
        <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] relative shrink-0 text-[36px] whitespace-nowrap">進め方</p>
        <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[0] min-w-full relative shrink-0 text-[0px] w-[min-content]">
          <span className="leading-[1.5] text-[32px]">テキスト</span>
          <span className="leading-[1.5] text-[32px]">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</span>
        </p>
      </div>
    </div>
  );
}

function Ul2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="ul">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 text-[#18191e] w-full" data-name="li">
        <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] relative shrink-0 text-[36px] whitespace-nowrap">期待する効果</p>
        <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[0] min-w-full relative shrink-0 text-[0px] w-[min-content]">
          <span className="leading-[1.5] text-[32px]">テキスト</span>
          <span className="leading-[1.5] text-[32px]">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</span>
        </p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[48px] items-start justify-center left-1/2 top-[360px] w-[1728px]">
      <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="box03">
        <div className="content-stretch flex flex-col items-start p-[40px] relative size-full">
          <Ul />
        </div>
      </div>
      <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="box03">
        <div className="content-stretch flex flex-col items-start p-[40px] relative size-full">
          <Ul1 />
        </div>
      </div>
      <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="box03">
        <div className="content-stretch flex flex-col items-start p-[40px] relative size-full">
          <Ul2 />
        </div>
      </div>
    </div>
  );
}

export default function Template() {
  return (
    <div className="bg-white relative size-full" data-name="template05">
      <div className="absolute content-stretch flex items-center justify-center left-[96px] top-[88px]" data-name="Heading1">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">特記事項:時計の紹介料一律800円値上げ</p>
      </div>
      <p className="[word-break:break-word] absolute font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] left-[96px] not-italic text-[#18191e] text-[48px] top-[224px] whitespace-nowrap">8/1実施に向けた準備</p>
      <Frame />
    </div>
  );
}