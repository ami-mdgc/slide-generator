import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "./ui/utils";

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      handleFileRead(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="mb-2">原稿ファイルをアップロード</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          .mdまたは.txtファイルをドラッグ&ドロップ、またはクリックして選択
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button onClick={() => fileInputRef.current?.click()}>
          <FileText className="h-4 w-4 mr-2" />
          ファイルを選択
        </Button>

        <div className="mt-8 text-xs text-muted-foreground">
          <p>スライドは「---」で区切って作成されます</p>
          <p className="mt-1">例: スライド1の内容 --- スライド2の内容</p>
        </div>
      </div>
    </Card>
  );
}
