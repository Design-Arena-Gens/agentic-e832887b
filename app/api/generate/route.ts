import { NextRequest, NextResponse } from "next/server";
import { generateId, now, truncate } from "@/lib/utils";
import { saveJob } from "@/lib/storage";
import { generateScenarioFromText } from "@/lib/openai";
import { requestShortVideoFromScenario } from "@/lib/video";
import { uploadToYouTubeFromUrl } from "@/lib/youtube";
import type { Job } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "??? ???? ???? ???" }, { status: 400 });
  }

  // Create job
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

    const { url, provider } = await requestShortVideoFromScenario(job.scenario);
    job.videoUrl = url;
    job.provider = provider;
    job.status = "video_ready";
    job.updatedAt = now();
    await saveJob(job);

    // Try YouTube upload if configured
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
    } catch (e: any) {
      // Not fatal if not configured
    }

    job.status = "done";
    job.updatedAt = now();
    await saveJob(job);
    return NextResponse.json({ id: job.id });
  } catch (e: any) {
    job.status = "error";
    job.error = e?.message || "???? ??????";
    job.updatedAt = now();
    await saveJob(job);
    return NextResponse.json({ error: job.error }, { status: 500 });
  }
}

