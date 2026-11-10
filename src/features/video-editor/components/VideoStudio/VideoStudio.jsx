import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Crop,
  Download,
  FastForward,
  Film,
  FlipHorizontal2,
  FlipVertical2,
  Layers,
  Mic,
  MicOff,
  Move,
  Music,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Scissors,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  SplitSquareVertical,
  Square,
  Subtitles,
  Trash2,
  Type,
  Upload,
  Volume2,
  VolumeX,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
} from "lucide-react";
import { downloadBlob } from "../../../../utils/imageTools.js";
import "./VideoStudio.css";

const VIDEO_FILTERS = [
  { id: "none", label: "Normal", filter: "none" },
  { id: "cinematic", label: "Cinematic Ruby", filter: "contrast(1.25) saturate(1.2) sepia(0.2) hue-rotate(-15deg)" },
  { id: "cyberpunk", label: "Cyberpunk Neon", filter: "hue-rotate(180deg) saturate(1.8) contrast(1.2)" },
  { id: "vintage", label: "70s Retro", filter: "sepia(0.5) contrast(1.1) brightness(0.95)" },
  { id: "mono", label: "B&W Noir", filter: "grayscale(1) contrast(1.4)" },
  { id: "golden", label: "Golden Hour", filter: "sepia(0.35) saturate(1.3) brightness(1.05)" },
  { id: "teal-orange", label: "Teal & Orange", filter: "contrast(1.2) saturate(1.4) hue-rotate(30deg)" },
];

const ASPECT_RATIOS = [
  { id: "16-9", label: "16:9 Landscape (YouTube)", width: 640, height: 360 },
  { id: "9-16", label: "9:16 Portrait (Shorts / Reels)", width: 360, height: 640 },
  { id: "1-1", label: "1:1 Square (Instagram)", width: 480, height: 480 },
  { id: "4-5", label: "4:5 Portrait Feed", width: 400, height: 500 },
  { id: "21-9", label: "21:9 Ultrawide Cinema", width: 700, height: 300 },
];

const TRANSITIONS = [
  { id: "none", label: "None (Direct Cut)" },
  { id: "fade", label: "Fade to Black" },
  { id: "flash", label: "Ruby Glow Flash" },
  { id: "dissolve", label: "Cross Dissolve" },
  { id: "wipe", label: "Horizontal Wipe" },
  { id: "vignette", label: "Radial Iris Zoom" },
];

const EXPORT_RESOLUTIONS = [
  { id: "720p", label: "720p HD (1280×720)", width: 1280, height: 720 },
  { id: "1080p", label: "1080p Full HD (1920×1080)", width: 1920, height: 1080 },
  { id: "2k", label: "2K QHD (2560×1440)", width: 2560, height: 1440 },
  { id: "4k", label: "4K UHD (3840×2160)", width: 3840, height: 2160 },
];

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];

function VideoStudio({ notify }) {
  // Video Source & Playback State
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoName, setVideoName] = useState("Demo Project Video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);

  // Multi-Clip Sequencer State (Split & Merge)
  const [clips, setClips] = useState([
    { id: "clip-1", name: "Main Clip", startTime: 0, endTime: 10, duration: 10 },
  ]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  // Active Tool Panel Tab
  const [activeToolTab, setActiveToolTab] = useState("transform"); // transform, color, transitions, text, chroma, audio, clips

  // 1. Transform State (Rotate, Flip, Zoom, Pan, Aspect)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0); // 0.5 to 2.5
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("16-9");

  // 2. Speed Control & Playback Rate
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // 3. Color Grading & Filters
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [brightness, setBrightness] = useState(100); // 50 to 150%
  const [contrast, setContrast] = useState(100); // 50 to 150%
  const [saturation, setSaturation] = useState(100); // 0 to 200%
  const [hueRotate, setHueRotate] = useState(0); // -180 to 180deg
  const [vignetteAmount, setVignetteAmount] = useState(0); // 0 to 100%

  // 4. Transitions
  const [transitionType, setTransitionType] = useState("fade");

  // 5. Text & Subtitles & Animations
  const [subtitleText, setSubtitleText] = useState("PhotoPro Video Studio");
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [textPosition, setTextPosition] = useState("bottom"); // top, center, bottom
  const [textSize, setTextSize] = useState(26);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textBgColor, setTextBgColor] = useState("rgba(18, 22, 28, 0.85)");
  const [textAnimation, setTextAnimation] = useState("fade"); // none, fade, slide, pulse

  // 6. Chroma Key / Green Screen
  const [enableChromaKey, setEnableChromaKey] = useState(false);
  const [chromaColor, setChromaColor] = useState("#00ff00");
  const [chromaTolerance, setChromaTolerance] = useState(90);
  const [chromaBgType, setChromaBgType] = useState("dark"); // transparent, dark, gradient, custom

  // 7. Audio Editing, Music & SFX
  const [videoVolume, setVideoVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [musicSrc, setMusicSrc] = useState(null);
  const [musicName, setMusicName] = useState("");
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordSecs, setVoiceRecordSecs] = useState(0);
  const [voiceSrc, setVoiceSrc] = useState(null);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  // 8. Export Configuration
  const [exportRes, setExportRes] = useState("1080p");
  const [isExporting, setIsExporting] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const addClipInputRef = useRef(null);
  const musicInputRef = useRef(null);
  const micRecorderRef = useRef(null);
  const micTimerRef = useRef(null);
  const musicAudioRef = useRef(null);
  const voiceAudioRef = useRef(null);

  // Generate an in-memory animated motion video if no file is uploaded
  const loadDemoVideo = useCallback(() => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 640;
    demoCanvas.height = 360;
    const ctx = demoCanvas.getContext("2d");

    let frame = 0;
    const drawDemoFrame = () => {
      frame++;
      const grad = ctx.createLinearGradient(0, 0, 640, 360);
      grad.addColorStop(0, "#090b0e");
      grad.addColorStop(0.5, "#1e0b12");
      grad.addColorStop(1, "#3b0d18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);

      const orbX = 320 + Math.sin(frame * 0.05) * 180;
      const orbY = 180 + Math.cos(frame * 0.05) * 70;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 90);
      orbGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      orbGrad.addColorStop(0.3, "rgba(225, 29, 72, 0.8)");
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 24px 'Manrope', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PHOTOPRO VIDEO STUDIO", 320, 170);
      ctx.fillStyle = "#fda4af";
      ctx.font = "600 13px 'Manrope', sans-serif";
      ctx.fillText("100% In-Browser Multi-Track Timeline & Chroma Key", 320, 200);
    };

    const stream = demoCanvas.captureStream(30);
    const interval = setInterval(drawDemoFrame, 1000 / 30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      clearInterval(interval);
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoSrc(url);
      setVideoName("PhotoPro Demo Motion");
      setDuration(10);
      setClips([{ id: "clip-1", name: "PhotoPro Demo", startTime: 0, endTime: 10, duration: 10 }]);
      setActiveClipIndex(0);
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  }, []);

  useEffect(() => {
    loadDemoVideo();
  }, [loadDemoVideo]);

  // Handle Video Upload
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
    notify(`Loaded video: ${file.name}`);
    e.target.value = "";
  };

  // Add Additional Video Clip (Merge Feature)
  const handleAddVideoClip = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newClip = {
      id: `clip-${Date.now()}`,
      name: file.name,
      src: url,
      startTime: 0,
      endTime: 10,
      duration: 10,
    };
    setClips([...clips, newClip]);
    notify(`Added clip to timeline: ${file.name}`);
    e.target.value = "";
  };

  // Split Video at Current Playhead
  const handleSplitAtPlayhead = () => {
    if (!clips[activeClipIndex]) return;
    const current = currentTime;
    const activeClip = clips[activeClipIndex];

    if (current <= activeClip.startTime + 0.5 || current >= activeClip.endTime - 0.5) {
      notify("Move playhead inside the clip to split!");
      return;
    }

    const clipA = {
      ...activeClip,
      id: `clip-${Date.now()}-A`,
      name: `${activeClip.name} (Part 1)`,
      endTime: current,
      duration: Math.round((current - activeClip.startTime) * 10) / 10,
    };

    const clipB = {
      ...activeClip,
      id: `clip-${Date.now()}-B`,
      name: `${activeClip.name} (Part 2)`,
      startTime: current,
      duration: Math.round((activeClip.endTime - current) * 10) / 10,
    };

    const updatedClips = [...clips];
    updatedClips.splice(activeClipIndex, 1, clipA, clipB);
    setClips(updatedClips);
    notify(`Split clip at ${current.toFixed(1)}s!`);
  };

  // Delete Clip from Timeline
  const handleDeleteClip = (index) => {
    if (clips.length <= 1) {
      notify("Must keep at least one clip!");
      return;
    }
    const filtered = clips.filter((_, i) => i !== index);
    setClips(filtered);
    setActiveClipIndex(Math.max(0, index - 1));
    notify("Removed clip from timeline.");
  };

  // Audio SFX Synthesis
  const playSoundEffect = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === "whoosh") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "ding") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(987.77, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "shutter") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
      notify(`Triggered sound effect: ${type}`);
    } catch (e) {}
  };

  // Voiceover Microphone Recorder
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceSrc(url);
        stream.getTracks().forEach((t) => t.stop());
        notify("Voiceover captured successfully!");
      };
      recorder.start();
      micRecorderRef.current = recorder;
      setIsRecordingVoice(true);
      setVoiceRecordSecs(0);
      micTimerRef.current = setInterval(() => {
        setVoiceRecordSecs((s) => s + 1);
      }, 1000);
      notify("Recording microphone voiceover...");
    } catch (err) {
      notify("Microphone permission denied or device not found.");
    }
  };

  const stopVoiceRecording = () => {
    if (micRecorderRef.current && isRecordingVoice) {
      micRecorderRef.current.stop();
      clearInterval(micTimerRef.current);
      setIsRecordingVoice(false);
    }
  };

  // Sync background music & voiceover with playback
  useEffect(() => {
    const curClip = clips[activeClipIndex] || { startTime: 0 };
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = isMuted ? 0 : musicVolume;
      if (isPlaying) {
        musicAudioRef.current.currentTime = Math.max(0, currentTime - curClip.startTime);
        musicAudioRef.current.play().catch(() => {});
      } else {
        musicAudioRef.current.pause();
      }
    }
    if (voiceAudioRef.current) {
      voiceAudioRef.current.volume = isMuted ? 0 : voiceVolume;
      if (isPlaying) {
        voiceAudioRef.current.currentTime = Math.max(0, currentTime - curClip.startTime);
        voiceAudioRef.current.play().catch(() => {});
      } else {
        voiceAudioRef.current.pause();
      }
    }
  }, [isPlaying, currentTime, clips, activeClipIndex, isMuted, musicVolume, voiceVolume]);

  // Main Canvas Video Render Loop
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !videoSrc) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const targetRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
    canvas.width = targetRatio.width;
    canvas.height = targetRatio.height;

    const render = () => {
      if (video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const activeClip = clips[activeClipIndex] || { startTime: 0, endTime: 10 };
      if (video.currentTime >= activeClip.endTime) {
        video.currentTime = activeClip.startTime;
      }
      setCurrentTime(video.currentTime);

      // 1. Clear background
      if (enableChromaKey && chromaBgType === "gradient") {
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, "#0f172a");
        bgGrad.addColorStop(1, "#e11d48");
        ctx.fillStyle = bgGrad;
      } else {
        ctx.fillStyle = "#090b0e";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Filters & Adjustments
      let baseFilter = "";
      if (selectedFilter !== "none") {
        const filterObj = VIDEO_FILTERS.find((f) => f.id === selectedFilter);
        baseFilter = filterObj?.filter || "";
      }
      const adjustFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg)`;
      ctx.filter = baseFilter ? `${baseFilter} ${adjustFilter}` : adjustFilter;

      // 3. Transformations: Rotate, Flip, Scale, Pan
      ctx.save();
      ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -zoomScale : zoomScale, flipV ? -zoomScale : zoomScale);

      // Draw Video Frame centered
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();
      ctx.filter = "none";

      // 4. Chroma Key Removal (Green / Blue Screen)
      if (enableChromaKey) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const targetR = parseInt(chromaColor.slice(1, 3), 16) || 0;
        const targetG = parseInt(chromaColor.slice(3, 5), 16) || 255;
        const targetB = parseInt(chromaColor.slice(5, 7), 16) || 0;

        for (let i = 0; i < d.length; i += 4) {
          const diff = Math.sqrt(
            (d[i] - targetR) ** 2 +
            (d[i + 1] - targetG) ** 2 +
            (d[i + 2] - targetB) ** 2
          );
          if (diff < chromaTolerance) {
            d[i + 3] = 0; // Transparent keyed
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 5. Vignette Effect
      if (vignetteAmount > 0) {
        ctx.save();
        const radGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.2,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.7
        );
        radGrad.addColorStop(0, "transparent");
        radGrad.addColorStop(1, `rgba(0, 0, 0, ${vignetteAmount / 100})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 6. Transition Effects
      if (transitionType !== "none") {
        const relTime = video.currentTime - activeClip.startTime;
        const clipDur = Math.max(0.1, activeClip.endTime - activeClip.startTime);
        const transDur = 0.6;
        const progressIn = Math.min(1, Math.max(0, relTime / transDur));
        const progressOut = Math.min(1, Math.max(0, (clipDur - relTime) / transDur));
        const transAmount = Math.min(progressIn, progressOut);

        if (transAmount < 1) {
          ctx.save();
          if (transitionType === "fade") {
            ctx.fillStyle = `rgba(9, 11, 14, ${1 - transAmount})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (transitionType === "flash") {
            ctx.fillStyle = `rgba(225, 29, 72, ${(1 - transAmount) * 0.75})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (transitionType === "dissolve") {
            ctx.fillStyle = `rgba(18, 22, 28, ${(1 - transAmount) * 0.85})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (transitionType === "wipe") {
            const wipeWidth = canvas.width * (1 - transAmount);
            ctx.fillStyle = "#090b0e";
            ctx.fillRect(0, 0, wipeWidth, canvas.height);
          } else if (transitionType === "vignette") {
            const grad = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, canvas.width * 0.2 * transAmount,
              canvas.width / 2, canvas.height / 2, canvas.width * 0.7
            );
            grad.addColorStop(0, "transparent");
            grad.addColorStop(1, `rgba(0, 0, 0, ${1 - transAmount})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        }
      }

      // 7. Subtitle & Text Overlay with Keyframe Animations
      if (showSubtitle && subtitleText) {
        ctx.save();
        ctx.font = `800 ${textSize}px 'Manrope', sans-serif`;
        ctx.textAlign = "center";
        const tx = canvas.width / 2;
        let ty = canvas.height * 0.88;
        if (textPosition === "top") ty = canvas.height * 0.14;
        if (textPosition === "center") ty = canvas.height * 0.5;

        // Animated pulse or slide
        if (textAnimation === "pulse") {
          const pulseScale = 1 + Math.sin(video.currentTime * 5) * 0.05;
          ctx.translate(tx, ty);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-tx, -ty);
        }

        ctx.fillStyle = textBgColor;
        const textMetrics = ctx.measureText(subtitleText);
        const pw = textMetrics.width + 24;
        const ph = textSize + 14;
        ctx.fillRect(tx - pw / 2, ty - ph + 6, pw, ph);

        ctx.fillStyle = textColor;
        ctx.fillText(subtitleText, tx, ty);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    videoSrc,
    aspectRatio,
    rotation,
    flipH,
    flipV,
    zoomScale,
    panX,
    panY,
    brightness,
    contrast,
    saturation,
    hueRotate,
    vignetteAmount,
    selectedFilter,
    transitionType,
    enableChromaKey,
    chromaColor,
    chromaTolerance,
    chromaBgType,
    showSubtitle,
    subtitleText,
    textPosition,
    textSize,
    textColor,
    textBgColor,
    textAnimation,
    clips,
    activeClipIndex,
  ]);

  // Video Loaded Metadata Handler
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = Math.round(videoRef.current.duration) || 10;
    setDuration(dur);
    setClips([{ id: "clip-1", name: videoName, startTime: 0, endTime: dur, duration: dur }]);
    setActiveClipIndex(0);
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    const activeClip = clips[activeClipIndex] || { startTime: 0, endTime: 10 };
    if (videoRef.current.paused) {
      if (videoRef.current.currentTime < activeClip.startTime || videoRef.current.currentTime >= activeClip.endTime) {
        videoRef.current.currentTime = activeClip.startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Speed Change
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    notify(`Playback Speed set to ${speed}x`);
  };

  // Rotate 90 Degrees Clockwise
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    notify(`Rotated to ${nextRot}°`);
  };

  // Capture High-Res Snapshot Frame
  const captureFrameSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `photopro-frame-${Math.round(currentTime)}s.png`;
    link.click();
    notify("Captured 4K frame snapshot as PNG!");
  };

  // Export Video
  const handleExportVideo = () => {
    if (!canvasRef.current || !videoRef.current) return;
    setIsExporting(true);
    recordedChunksRef.current = [];

    const video = videoRef.current;
    const activeClip = clips[activeClipIndex] || { startTime: 0, endTime: 10 };
    video.currentTime = activeClip.startTime;

    const canvasStream = canvasRef.current.captureStream(30);
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 8000000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      downloadBlob(blob, `photopro-edit-${exportRes}.webm`);
      setIsExporting(false);
      notify(`Exported ${exportRes} video successfully!`);
    };

    mediaRecorder.start();
    video.play();
    setIsPlaying(true);

    const checkEnd = setInterval(() => {
      if (video.currentTime >= activeClip.endTime || video.paused) {
        clearInterval(checkEnd);
        mediaRecorder.stop();
        video.pause();
        setIsPlaying(false);
      }
    }, 200);
  };

  return (
    <main className="video-studio-page">
      {/* HIDDEN ELEMENTS */}
      <video
        ref={videoRef}
        src={videoSrc || ""}
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
        style={{ display: "none" }}
      />
      {musicSrc && <audio ref={musicAudioRef} src={musicSrc} loop />}
      {voiceSrc && <audio ref={voiceAudioRef} src={voiceSrc} />}

      {/* TOP STUDIO TOOLBAR */}
      <header className="video-studio-topbar">
        <div className="topbar-left">
          <div className="video-title-pill">
            <Film size={16} className="text-ruby" />
            <span className="video-name">{videoName}</span>
          </div>
          <span className="resolution-badge">{exportRes.toUpperCase()}</span>
        </div>

        <div className="topbar-center-controls">
          <button className="tb-btn" onClick={togglePlay} title="Play / Pause">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="tb-btn" onClick={handleSplitAtPlayhead} title="Split Clip at Current Playhead">
            <Scissors size={15} />
            <span>Split Clip</span>
          </button>
          <button className="tb-btn" onClick={handleRotate} title="Rotate 90° Clockwise">
            <RotateCw size={15} />
            <span>Rotate</span>
          </button>
          <button className="tb-btn" onClick={captureFrameSnapshot} title="Capture Current Frame Snapshot">
            <Camera size={15} />
            <span>Snapshot</span>
          </button>
        </div>

        <div className="topbar-right">
          <button className="button button-outline button-small" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Replace Video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={handleVideoUpload}
          />
          <button
            className="button button-primary header-export-btn"
            disabled={isExporting}
            onClick={handleExportVideo}
          >
            <Download size={15} />
            <span>{isExporting ? "Rendering..." : `Export ${exportRes}`}</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="video-main-layout">
        {/* LEFT TOOL CONTROLS RAIL */}
        <aside className="video-tools-sidebar">
          <div className="tools-nav-rail">
            {[
              { id: "transform", label: "Transform", icon: Move },
              { id: "color", label: "Color & Filters", icon: SlidersHorizontal },
              { id: "transitions", label: "Transitions", icon: Sparkles },
              { id: "text", label: "Subtitles & Text", icon: Type },
              { id: "chroma", label: "Green Screen", icon: Layers },
              { id: "audio", label: "Audio & SFX", icon: Music },
              { id: "clips", label: "Clips & Merge", icon: Film },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tool-nav-btn ${activeToolTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveToolTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="tool-settings-panel">
            {/* 1. TRANSFORM TAB */}
            {activeToolTab === "transform" && (
              <div className="tool-pane-content">
                <h3>Transform & Aspect Ratio</h3>

                <div className="setting-block">
                  <label>Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                    {ASPECT_RATIOS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Zoom & Scale: {(zoomScale * 100).toFixed(0)}%</label>
                    <button className="text-btn" onClick={() => setZoomScale(1.0)}>
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                  />
                </div>

                <div className="setting-block">
                  <label>Flip & Mirror</label>
                  <div className="button-group-pair">
                    <button
                      className={`toggle-chip ${flipH ? "active" : ""}`}
                      onClick={() => setFlipH(!flipH)}
                    >
                      <FlipHorizontal2 size={14} /> Flip Horizontal
                    </button>
                    <button
                      className={`toggle-chip ${flipV ? "active" : ""}`}
                      onClick={() => setFlipV(!flipV)}
                    >
                      <FlipVertical2 size={14} /> Flip Vertical
                    </button>
                  </div>
                </div>

                <div className="setting-block">
                  <label>Playback Speed</label>
                  <div className="speed-pills-row">
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        className={`speed-pill ${playbackSpeed === spd ? "active" : ""}`}
                        onClick={() => handleSpeedChange(spd)}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. COLOR & FILTERS TAB */}
            {activeToolTab === "color" && (
              <div className="tool-pane-content">
                <h3>Color Grading & Filters</h3>

                <div className="setting-block">
                  <label>Cinematic Preset</label>
                  <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                    {VIDEO_FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Brightness: {brightness}%</label>
                    <button className="text-btn" onClick={() => setBrightness(100)}>
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                  />
                </div>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Contrast: {contrast}%</label>
                    <button className="text-btn" onClick={() => setContrast(100)}>
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                  />
                </div>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Saturation: {saturation}%</label>
                    <button className="text-btn" onClick={() => setSaturation(100)}>
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                  />
                </div>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Vignette Edge: {vignetteAmount}%</label>
                    <button className="text-btn" onClick={() => setVignetteAmount(0)}>
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={vignetteAmount}
                    onChange={(e) => setVignetteAmount(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* 3. TRANSITIONS TAB */}
            {activeToolTab === "transitions" && (
              <div className="tool-pane-content">
                <h3>Video Transitions</h3>
                <p className="tool-desc">Applies procedural transition animations at scene boundaries.</p>

                <div className="transitions-grid">
                  {TRANSITIONS.map((t) => (
                    <button
                      key={t.id}
                      className={`trans-card ${transitionType === t.id ? "active" : ""}`}
                      onClick={() => {
                        setTransitionType(t.id);
                        notify(`Applied transition: ${t.label}`);
                      }}
                    >
                      <Sparkles size={16} />
                      <strong>{t.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TEXT & SUBTITLES TAB */}
            {activeToolTab === "text" && (
              <div className="tool-pane-content">
                <h3>Subtitles & Text Overlays</h3>

                <div className="setting-block">
                  <label>Subtitle Content</label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder="Enter subtitle caption..."
                  />
                </div>

                <div className="setting-block">
                  <label>Position On Screen</label>
                  <div className="button-group-three">
                    {["top", "center", "bottom"].map((pos) => (
                      <button
                        key={pos}
                        className={`toggle-chip ${textPosition === pos ? "active" : ""}`}
                        onClick={() => setTextPosition(pos)}
                      >
                        {pos.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label>Font Size: {textSize}px</label>
                  <input
                    type="range"
                    min="14"
                    max="50"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                  />
                </div>

                <div className="setting-block">
                  <label>Text Animation Style</label>
                  <select value={textAnimation} onChange={(e) => setTextAnimation(e.target.value)}>
                    <option value="none">Static Text</option>
                    <option value="pulse">Keyframe Pulse Zoom</option>
                    <option value="fade">Smooth Fade In</option>
                  </select>
                </div>
              </div>
            )}

            {/* 5. CHROMA KEY TAB */}
            {activeToolTab === "chroma" && (
              <div className="tool-pane-content">
                <h3>Green Screen & Chroma Key</h3>

                <div className="setting-block">
                  <label className="toggle-label-row">
                    <span>Enable Chroma Key</span>
                    <input
                      type="checkbox"
                      checked={enableChromaKey}
                      onChange={(e) => setEnableChromaKey(e.target.checked)}
                    />
                  </label>
                </div>

                {enableChromaKey && (
                  <>
                    <div className="setting-block">
                      <label>Target Key Color</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          value={chromaColor}
                          onChange={(e) => setChromaColor(e.target.value)}
                        />
                        <button
                          className="toggle-chip active"
                          onClick={() => setChromaColor("#00ff00")}
                        >
                          Green (#00ff00)
                        </button>
                        <button
                          className="toggle-chip"
                          onClick={() => setChromaColor("#0000ff")}
                        >
                          Blue (#0000ff)
                        </button>
                      </div>
                    </div>

                    <div className="setting-block">
                      <label>Color Tolerance: {chromaTolerance}</label>
                      <input
                        type="range"
                        min="20"
                        max="160"
                        value={chromaTolerance}
                        onChange={(e) => setChromaTolerance(Number(e.target.value))}
                      />
                    </div>

                    <div className="setting-block">
                      <label>Background Fill</label>
                      <select value={chromaBgType} onChange={(e) => setChromaBgType(e.target.value)}>
                        <option value="dark">Obsidian Dark</option>
                        <option value="gradient">Cyberpunk Gradient</option>
                        <option value="transparent">Transparent PNG</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 6. AUDIO & SFX TAB */}
            {activeToolTab === "audio" && (
              <div className="tool-pane-content">
                <h3>Audio Mixer & Sound FX</h3>

                <div className="setting-block">
                  <div className="setting-header">
                    <label>Main Video Audio: {(videoVolume * 100).toFixed(0)}%</label>
                    <button className="text-btn" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : videoVolume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVideoVolume(v);
                      if (videoRef.current) videoRef.current.volume = v;
                    }}
                  />
                </div>

                <div className="setting-block">
                  <label>Background Music Track</label>
                  <button
                    className="button button-outline full-width"
                    onClick={() => musicInputRef.current?.click()}
                  >
                    <Music size={14} />
                    <span>{musicName || "Upload MP3 Soundtrack"}</span>
                  </button>
                  <input
                    ref={musicInputRef}
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMusicSrc(URL.createObjectURL(file));
                        setMusicName(file.name);
                        notify(`Loaded music: ${file.name}`);
                      }
                    }}
                  />
                </div>

                <div className="setting-block">
                  <label>Microphone Voiceover</label>
                  <button
                    className={`button full-width ${isRecordingVoice ? "button-primary" : "button-outline"}`}
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                  >
                    {isRecordingVoice ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isRecordingVoice ? `Stop Recording (${voiceRecordSecs}s)` : "Record Live Voiceover"}</span>
                  </button>
                </div>

                <div className="setting-block">
                  <label>Synthesized Sound FX Library</label>
                  <div className="sfx-buttons-grid">
                    <button className="sfx-chip" onClick={() => playSoundEffect("whoosh")}>
                      💨 Whoosh
                    </button>
                    <button className="sfx-chip" onClick={() => playSoundEffect("ding")}>
                      🔔 Ding
                    </button>
                    <button className="sfx-chip" onClick={() => playSoundEffect("pop")}>
                      💥 Pop
                    </button>
                    <button className="sfx-chip" onClick={() => playSoundEffect("shutter")}>
                      📸 Shutter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CLIPS & MERGE TAB */}
            {activeToolTab === "clips" && (
              <div className="tool-pane-content">
                <h3>Multi-Clip Sequencer (Merge)</h3>
                <p className="tool-desc">Upload multiple video clips to sequence and merge into one continuous video.</p>

                <div className="clips-manager-list">
                  {clips.map((clip, index) => (
                    <div
                      key={clip.id}
                      className={`clip-manager-item ${activeClipIndex === index ? "active" : ""}`}
                      onClick={() => setActiveClipIndex(index)}
                    >
                      <span className="clip-num">{index + 1}</span>
                      <div className="clip-meta">
                        <strong>{clip.name}</strong>
                        <small>
                          {clip.startTime.toFixed(1)}s - {clip.endTime.toFixed(1)}s ({clip.duration.toFixed(1)}s)
                        </small>
                      </div>
                      <button
                        className="clip-del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClip(index);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="button button-outline full-width"
                  onClick={() => addClipInputRef.current?.click()}
                >
                  <Upload size={14} /> Add Another Video Clip
                </button>
                <input
                  ref={addClipInputRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleAddVideoClip}
                />
              </div>
            )}
          </div>
        </aside>

        {/* CENTER VIEWPORT PREVIEW CANVAS */}
        <section className="video-viewport-area">
          <div className="canvas-wrapper-box">
            <canvas ref={canvasRef} className="video-studio-canvas" />
          </div>

          {/* PLAYHEAD SCRUBBER BAR */}
          <div className="scrubber-bar-container">
            <span className="timecode-display">
              {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
            <input
              type="range"
              min="0"
              max={duration || 10}
              step="0.05"
              value={currentTime}
              className="timeline-scrubber-slider"
              onChange={(e) => {
                const target = Number(e.target.value);
                setCurrentTime(target);
                if (videoRef.current) videoRef.current.currentTime = target;
              }}
            />
          </div>

          {/* MULTI-TRACK SEQUENCER TIMELINE */}
          <div className="multi-track-timeline">
            {/* TRACK 1: VIDEO CLIPS */}
            <div className="timeline-track-row">
              <div className="track-header-label">
                <Film size={13} />
                <span>V1 Video</span>
              </div>
              <div className="track-lane-content">
                {clips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className={`timeline-clip-block ${activeClipIndex === idx ? "active" : ""}`}
                    style={{ flex: Math.max(1, clip.duration) }}
                    onClick={() => setActiveClipIndex(idx)}
                  >
                    <span>{clip.name}</span>
                    <small>{clip.duration.toFixed(1)}s</small>
                  </div>
                ))}
              </div>
            </div>

            {/* TRACK 2: SUBTITLES / OVERLAY */}
            <div className="timeline-track-row">
              <div className="track-header-label">
                <Type size={13} />
                <span>T1 Text</span>
              </div>
              <div className="track-lane-content">
                {showSubtitle && subtitleText && (
                  <div className="timeline-overlay-block text-overlay-block">
                    <span>{subtitleText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* TRACK 3: BACKGROUND MUSIC */}
            <div className="timeline-track-row">
              <div className="track-header-label">
                <Music size={13} />
                <span>A1 Music</span>
              </div>
              <div className="track-lane-content">
                {musicName ? (
                  <div className="timeline-overlay-block audio-music-block">
                    <span>🎵 {musicName}</span>
                  </div>
                ) : (
                  <div className="timeline-empty-lane">Click Audio Tab to Add Soundtrack</div>
                )}
              </div>
            </div>

            {/* TRACK 4: VOICEOVER */}
            <div className="timeline-track-row">
              <div className="track-header-label">
                <Mic size={13} />
                <span>A2 Voice</span>
              </div>
              <div className="track-lane-content">
                {voiceSrc ? (
                  <div className="timeline-overlay-block audio-voice-block">
                    <span>🎙️ Captured Voiceover Track</span>
                  </div>
                ) : (
                  <div className="timeline-empty-lane">No Voiceover Recorded</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default VideoStudio;
