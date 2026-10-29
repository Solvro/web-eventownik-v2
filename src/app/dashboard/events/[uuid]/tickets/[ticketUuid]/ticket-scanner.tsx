"use client";

import type { ScannerErrorKind } from "@yudiel/react-qr-scanner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { format } from "date-fns";
import {
  CameraOff,
  CircleAlert,
  CircleCheck,
  CircleX,
  Keyboard,
  Loader2,
  RotateCcw,
  ScanBarcode,
  UserCheck,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { translateOrFallback } from "@/i18n/utils";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { TicketScanResult, TicketScanStatus } from "@/types/tickets";

import { formatTicketAttribute } from "../(attendance)/columns";
import { checkInTicket, scanTicket } from "../actions";

const SUCCESS_VIBRATION = 80;
const FAILURE_VIBRATION = [150, 80, 150];

const STATUS_TITLES = {
  VALID: "statusValid",
  ALREADY_CONFIRMED: "statusAlreadyConfirmed",
  INVALID_TICKET: "statusInvalidTicket",
  WRONG_EVENT: "statusWrongEvent",
  WRONG_BLOCK: "statusWrongBlock",
} as const satisfies Record<TicketScanStatus, string>;

const CAMERA_ERRORS: Partial<
  Record<ScannerErrorKind, "cameraPermissionDenied" | "noCameraFound">
> = {
  "permission-denied": "cameraPermissionDenied",
  "no-camera": "noCameraFound",
};

const TONE_STYLES = {
  success: {
    border: "border-green-600 dark:border-green-500",
    text: "text-green-600 dark:text-green-500",
    icon: CircleCheck,
  },
  warning: {
    border: "border-amber-500",
    text: "text-amber-600 dark:text-amber-500",
    icon: CircleAlert,
  },
  error: {
    border: "border-destructive",
    text: "text-destructive",
    icon: CircleX,
  },
};

interface ScanState {
  token: string;
  result: TicketScanResult;
  confirmed: boolean;
}

function vibrate(pattern: number | number[]) {
  // Not supported on iOS Safari
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function getTone(scan: ScanState) {
  if (scan.confirmed || scan.result.status === "VALID") {
    return "success";
  }
  return scan.result.status === "ALREADY_CONFIRMED" ? "warning" : "error";
}

/** Staff may paste the whole ticket link from the participant's email instead of the bare token */
function extractToken(input: string) {
  const trimmed = input.trim();
  const match = /\/ticket\/([^#/?]+)/.exec(trimmed);
  return match === null ? trimmed : match[1];
}

function TicketScanner({
  eventUuid,
  ticketUuid,
  blocks,
  attributeName,
}: {
  eventUuid: string;
  ticketUuid: string;
  /** Blocks of the ticket's attribute. Null for EVENT tickets */
  blocks: Block[] | null;
  /** Name of the ticket's attribute. Null for EVENT tickets */
  attributeName: string | null;
}) {
  const t = useTranslations("Tickets");
  const tEventDetails = useTranslations("EventDetails");
  const { toast } = useToast();
  const searchParameters = useSearchParams();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<ScannerErrorKind | null>(null);
  const [scan, setScan] = useState<ScanState | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualToken, setManualToken] = useState("");

  // The chosen block lives in the URL, so it survives a refresh
  const blockUuid = blocks?.find(
    (block) => block.uuid === searchParameters.get("block"),
  )?.uuid;
  const isBlockMissing = blocks !== null && blockUuid === undefined;
  const isPaused = scan !== null || isChecking;

  const resetScan = () => {
    setScan(null);
    setManualToken("");
  };

  const changeBlock = (uuid: string) => {
    // Doesn't trigger a server round trip, unlike router.replace
    globalThis.history.replaceState(null, "", `?block=${uuid}`);
    resetScan();
  };

  const checkTicket = async (rawToken: string) => {
    const token = extractToken(rawToken);
    if (token === "" || isBlockMissing) {
      return;
    }

    setIsChecking(true);
    const response = await scanTicket(eventUuid, ticketUuid, token, blockUuid);
    setIsChecking(false);

    if (response.result === undefined) {
      toast({
        title: t("failedToCheckTicket"),
        description: translateOrFallback(
          tEventDetails,
          response.error.key,
          response.error.values,
        ),
        variant: "destructive",
      });
      return;
    }

    setScan({ token, result: response.result, confirmed: false });
    setManualToken("");
    vibrate(
      response.result.status === "VALID"
        ? SUCCESS_VIBRATION
        : FAILURE_VIBRATION,
    );
  };

  const confirmAttendance = async () => {
    if (scan === null) {
      return;
    }

    setIsConfirming(true);
    const response = await checkInTicket(
      eventUuid,
      ticketUuid,
      scan.token,
      blockUuid,
    );

    if (response.checkIn !== undefined) {
      setScan({ ...scan, confirmed: true });
      vibrate(SUCCESS_VIBRATION);
    } else if (response.rejection === undefined) {
      toast({
        title: t("failedToConfirmAttendance"),
        description: translateOrFallback(
          tEventDetails,
          response.error.key,
          response.error.values,
        ),
        variant: "destructive",
      });
    } else {
      // Someone else confirmed them in the meantime, or their registration changed. Rejections carry no participant details, so scan again
      const rescan = await scanTicket(
        eventUuid,
        ticketUuid,
        scan.token,
        blockUuid,
      );
      setScan({
        token: scan.token,
        result: rescan.result ?? { status: response.rejection.status },
        confirmed: false,
      });
      vibrate(FAILURE_VIBRATION);
    }
    setIsConfirming(false);
  };

  const frameClassName =
    "bg-muted/50 text-muted-foreground relative flex size-[min(100cqw,100cqh,24rem)] flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed p-4 text-center";

  const renderFrame = () => {
    if (cameraError !== null) {
      return (
        <div className={frameClassName}>
          <CameraOff className="size-8 shrink-0" />
          <p className="text-sm">
            {t(CAMERA_ERRORS[cameraError] ?? "cameraError")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCameraError(null);
            }}
          >
            <RotateCcw /> {t("tryAgain")}
          </Button>
        </div>
      );
    }

    if (isCameraOn) {
      return (
        <div className={cn(frameClassName, "p-0")}>
          <Scanner
            onScan={(codes) => {
              const code = codes.at(0);
              if (code !== undefined && !isPaused) {
                void checkTicket(code.rawValue);
              }
            }}
            onError={(error) => {
              setCameraError(error.kind);
            }}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code"]}
            paused={isPaused}
            sound={false}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { objectFit: "cover" },
            }}
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        className={cn(
          frameClassName,
          "hover:bg-muted disabled:hover:bg-muted/50 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        )}
        disabled={isBlockMissing}
        onClick={() => {
          setIsCameraOn(true);
        }}
      >
        <ScanBarcode className="size-8 shrink-0" />
        <span className="font-medium">{t("beginScan")}</span>
        {isBlockMissing ? (
          <span className="text-sm">{t("selectBlockFirst")}</span>
        ) : null}
      </button>
    );
  };

  const renderResult = () => {
    if (isChecking) {
      return (
        <div className="text-muted-foreground flex grow items-center justify-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> {t("checkingTicket")}
        </div>
      );
    }

    if (scan === null) {
      return (
        <p className="text-muted-foreground flex grow items-center justify-center text-center text-sm">
          {t("scanPlaceholder")}
        </p>
      );
    }

    const { result } = scan;
    const { text, icon: Icon } = TONE_STYLES[getTone(scan)];

    let detail: string | null = null;
    if (
      result.status === "ALREADY_CONFIRMED" &&
      result.confirmedAt !== undefined
    ) {
      detail = t("checkedInAtTime", {
        time: format(result.confirmedAt, "HH:mm"),
      });
    } else if (result.status === "INVALID_TICKET") {
      detail = t("invalidTicketDetail");
    } else if (result.status === "WRONG_EVENT") {
      detail = t("wrongEventDetail");
    } else if (
      result.status === "WRONG_BLOCK" &&
      result.blockNames !== undefined
    ) {
      detail =
        result.blockNames.length === 0
          ? t("notRegisteredForAnyBlock", {
              attribute: attributeName ?? "",
            })
          : t("registeredFor", { blocks: result.blockNames.join(", ") });
    }

    return (
      <>
        <div className={cn("flex items-start gap-2", text)}>
          <Icon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {scan.confirmed
                ? t("attendanceConfirmed")
                : t(STATUS_TITLES[result.status])}
            </p>
            {detail === null ? null : <p className="text-sm">{detail}</p>}
          </div>
        </div>
        {result.participant === undefined ? null : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <div className="contents">
              <dt className="text-muted-foreground">{t("email")}</dt>
              <dd className="break-all">{result.participant.email}</dd>
            </div>
            {result.attributes?.map((attribute) => (
              <div key={attribute.attributeUuid} className="contents">
                <dt className="text-muted-foreground">{attribute.name}</dt>
                <dd className="wrap-break-word">
                  {formatTicketAttribute(attribute)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {blocks === null ? null : blocks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("noBlocksInAttribute")}
        </p>
      ) : (
        <Select value={blockUuid ?? ""} onValueChange={changeBlock}>
          <SelectTrigger
            className="h-9 shrink-0 sm:w-64"
            aria-label={t("selectBlock")}
          >
            <SelectValue placeholder={t("selectBlock")} />
          </SelectTrigger>
          <SelectContent>
            {blocks.map((block) => (
              <SelectItem key={block.uuid} value={block.uuid}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-8">
        <div className="flex min-h-0 flex-1 flex-col items-center gap-2">
          {/* Lets the frame stay square within whatever space is left */}
          <div className="@container-[size] flex min-h-0 w-full flex-1 items-center justify-center">
            {renderFrame()}
          </div>
          {isManualEntryOpen ? (
            <form
              className="flex w-full max-w-sm shrink-0 gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void checkTicket(manualToken);
              }}
            >
              <Input
                className="h-9 min-w-0 text-sm"
                placeholder={t("ticketCode")}
                aria-label={t("ticketCode")}
                value={manualToken}
                onChange={(event) => {
                  setManualToken(event.target.value);
                }}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={
                  isBlockMissing ||
                  isChecking ||
                  isConfirming ||
                  manualToken.trim() === ""
                }
              >
                {t("check")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("closeManualEntry")}
                onClick={() => {
                  setIsManualEntryOpen(false);
                  setManualToken("");
                }}
              >
                <X />
              </Button>
            </form>
          ) : (
            <Button
              variant="link"
              size="sm"
              className="h-9 shrink-0"
              onClick={() => {
                setIsManualEntryOpen(true);
              }}
            >
              <Keyboard /> {t("enterCodeManually")}
            </Button>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 lg:flex-1">
          <div
            className={cn(
              "flex h-36 flex-col gap-3 overflow-y-auto rounded-md border p-4 lg:h-auto lg:flex-1",
              scan !== null && !isChecking && TONE_STYLES[getTone(scan)].border,
            )}
          >
            {renderResult()}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={
                scan?.result.status !== "VALID" ||
                scan.confirmed ||
                isConfirming
              }
              onClick={() => {
                void confirmAttendance();
              }}
            >
              {isConfirming ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserCheck />
              )}
              {isConfirming ? t("confirming") : t("confirmAttendance")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={scan === null || isConfirming}
              onClick={resetScan}
            >
              <RotateCcw /> {t("resetScan")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TicketScanner };
