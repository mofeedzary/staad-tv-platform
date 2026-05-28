import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export function HlsPlayer({ src, poster, autoPlay = true }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    const isM3U8 = src.includes(".m3u8") || src.includes("playlist") || src.includes(".smil");

    if (isM3U8 && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS error", data);
        }
      });
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, autoPlay]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-card">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        className="aspect-video w-full"
      />
    </div>
  );
}
