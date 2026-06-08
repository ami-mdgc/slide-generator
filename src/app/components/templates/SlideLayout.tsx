import { ReactNode } from "react";

/**
 * スライドの96pxセーフエリア。
 * このコンポーネント内に配置したコンテンツはスライド端から96px以内には絶対に出られない。
 * 座標はセーフエリア左上(=スライド上で left:96 top:96)を origin(0,0) として扱う。
 * セーフエリアのサイズ: 1728 × 888 px
 */
export function SafeArea({ children }: { children: ReactNode }) {
  return (
    <div className="absolute overflow-hidden" style={{ inset: 96 }}>
      {children}
    </div>
  );
}
