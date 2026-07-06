import { Image } from "lucide-react";

export default function NoImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ivory">
      <div className="text-center">
        <Image className="mx-auto h-10 w-10 text-stone/30" />
        <p className="mt-2 text-xs font-bold text-stone/40">
          No Image Available
        </p>
      </div>
    </div>
  );
}
