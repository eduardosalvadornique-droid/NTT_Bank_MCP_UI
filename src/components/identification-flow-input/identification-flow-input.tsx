import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import "./identification-flow-input.css";
import type { IdentificationFlowLabels } from "../../mock/identification-flow";

type Props = {
  labels: IdentificationFlowLabels;
  scale?: number;
  dni?: string;
  defaultDni?: string;
  onDniChange?: (dni: string) => void;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  className?: string;
};

export default function IdentificationFlowInput({
  labels,
  scale = 1,
  dni,
  defaultDni = "",
  onDniChange,
  file,
  onFileChange,
  className = "",
}: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isControlled = dni !== undefined;
  const [uncontrolledDni, setUncontrolledDni] = useState(defaultDni);
  const currentDni = isControlled ? dni : uncontrolledDni;

  const setDniValue = (next: string) => {
    if (!isControlled) setUncontrolledDni(next);
    onDniChange?.(next);
  };

  const isFileControlled = file !== undefined;
  const [uncontrolledFile, setUncontrolledFile] = useState<File | null>(null);
  const selectedFile = isFileControlled ? (file ?? null) : uncontrolledFile;
  const isDniValid = currentDni.trim().length > 0;
  const isFormValid = Boolean(selectedFile) && isDniValid;

  const setSelectedFile = (next: File | null) => {
    if (!isFileControlled) setUncontrolledFile(next);
    onFileChange?.(next);
  };

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const stopCameraStream = () => {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const handlePickPhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setIsCameraOpen(true);
      return;
    } catch (err) {
      console.error("getUserMedia error:", err);
    }
    fileInputRef.current?.click();
  };

  const handleCancelCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
  };

  const handleCapturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });
    if (!blob) return;

    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setSelectedFile(capturedFile);
    stopCameraStream();
    setIsCameraOpen(false);
  };

  const handleSendData = () => {
    if (!isFormValid) return;

    window.parent?.postMessage(
      {
        type: "identification_send_data",
        value: currentDni,
      },
      "*",
    );

    console.log("sent value");
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!isCameraOpen || !cameraStream || !videoRef.current) return;
    videoRef.current.srcObject = cameraStream;
  }, [cameraStream, isCameraOpen]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const style: CSSProperties = {
    ["--identificationFlowScale" as any]: normalizedScale,
  };

  return (
    <div className={`identificationFlow ${className}`} style={style}>
      <div className="identificationFlow__row">
        <div className="identificationFlow__label">
          <span className="identificationFlow__labelIndex">1.</span>
          <label className="identificationFlow__labelText" htmlFor={inputId}>
            {labels.dniLabel}
          </label>
        </div>

        <div className="identificationFlow__control">
          <input
            id={inputId}
            className="identificationFlow__input"
            type="text"
            inputMode="numeric"
            value={currentDni}
            onChange={(e) => setDniValue(e.target.value)}
            placeholder={labels.dniPlaceholder}
            aria-label={labels.dniLabel}
          />
        </div>
      </div>

      <div className="identificationFlow__row identificationFlow__row--photo">
        <div className="identificationFlow__label">
          <span className="identificationFlow__labelIndex">2.</span>
          <span className="identificationFlow__labelText">
            {labels.photoLabel}
          </span>
        </div>

        <div className="identificationFlow__control">
          <input
            ref={fileInputRef}
            className="identificationFlow__fileInput"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const nextFile = e.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
            }}
          />

          {previewUrl ? (
            <div className="identificationFlow__preview">
              <img
                className="identificationFlow__previewImg"
                src={previewUrl}
                alt="Foto tomada"
              />
              <button
                type="button"
                className="identificationFlow__removePhoto"
                onClick={() => {
                  setSelectedFile(null);
                  handleCancelCamera();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Quitar foto"
              >
                ×
              </button>
            </div>
          ) : isCameraOpen ? (
            <div className="identificationFlow__cameraCapture">
              <video
                ref={videoRef}
                className="identificationFlow__cameraVideo"
                autoPlay
                playsInline
                muted
              />
              <div className="identificationFlow__cameraActions">
                <button
                  type="button"
                  className="identificationFlow__photoButton"
                  onClick={handleCapturePhoto}
                >
                  Capturar foto
                </button>
                <button
                  type="button"
                  className="identificationFlow__cameraCancelButton"
                  onClick={handleCancelCamera}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="identificationFlow__photoButton"
              onClick={handlePickPhoto}
            >
              <span className="identificationFlow__camera" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 4.5 7.8 6H6.2C4.98 6 4 6.98 4 8.2v9.6C4 19.02 4.98 20 6.2 20h11.6c1.22 0 2.2-.98 2.2-2.2V8.2C20 6.98 19.02 6 17.8 6h-1.6L15 4.5H9Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span className="identificationFlow__photoText">
                {labels.photoButtonText}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="identificationFlow__actions">
        <div className="identificationFlow__labelSpacer" />
        <div className="identificationFlow__control">
          <button
            type="button"
            className="identificationFlow__submitButton"
            onClick={handleSendData}
            disabled={!isFormValid}
          >
            Enviar datos
          </button>
        </div>
      </div>
    </div>
  );
}
