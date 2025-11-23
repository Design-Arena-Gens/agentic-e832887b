import { NextRequest, NextResponse } from "next/server";
import { generateScenarioFromText } from "@/lib/openai";
import { requestShortVideoFromScenario } from "@/lib/video";
import { uploadToYouTubeFromUrl } from "@/lib/youtube";
import { generateId, now, truncate } from "@/lib/utils";
import { saveJob } from "@/lib/storage";
import type { Job } from "@/lib/types";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const update = await req.json().catch(() => ({} as any));
  const message = update?.message;
  const text = message?.text as string | undefined;
  const chatId = message?.chat?.id;
  if (!text || !chatId) {
    return NextResponse.json({ ok: true });
  }

  const job: Job = {
    id: generateId(),
    text: text.trim(),
    status: "received",
    createdAt: now(),
    updatedAt: now()
  };
  await saveJob(job);

  try {
    const { title, scenario } = await generateScenarioFromText(job.text);
    job.title = title || truncate(job.text, 90);
    job.scenario = scenario;
    job.status = "scenario_created";
    job.updatedAt = now();
    await saveJob(job);

    const { url, provider } = await requestShortVideoFromScenario(job.scenario!);
    job.videoUrl = url;
    job.provider = provider;
    job.status = "video_ready";
    job.updatedAt = now();
    await saveJob(job);

    await sendTelegramMessage(
      chatId,
      `?????? ????? ?? ? ????? ????? ?????.\n?????: ${job.title}\n?????: ${job.videoUrl}`
    );

    try {
      job.status = "youtube_uploading";
      job.updatedAt = now();
      await saveJob(job);
      const yt = await uploadToYouTubeFromUrl({
        url: job.videoUrl!,
        title: job.title!,
        description:
          (job.scenario || "") +
          "\n\n????? ??????: ??? ?????? -> ?????? ChatGPT -> ????? ?????",
        tags: ["shorts", "auto", "ai", "telegram"],
        privacyStatus: "unlisted"
      });
      job.youtubeVideoId = yt.videoId;
      await sendTelegramMessage(
        chatId,
        `????? ?????? ????? ??: https://youtube.com/watch?v=${yt.videoId}`
      );
    } catch {
      await sendTelegramMessage(chatId, "????? ?????? ???????? ???? ?? ?? ??? ????? ??.");
    }

    job.status = "done";
    job.updatedAt = now();
    await saveJob(job);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    job.status = "error";
    job.error = e?.message || "???? ??????";
    job.updatedAt = now();
    await saveJob(job);
    await sendTelegramMessage(chatId, "??? ?? ?????? ??????? ???.");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

