import { JobsList } from "@/lib/types";

async function fetchJobs(): Promise<JobsList> {
  const res = await fetch(`${process.env.PUBLIC_BASE_URL || ""}/api/jobs`, {
    cache: "no-store"
  });
  if (!res.ok) {
    return { jobs: [] };
  }
  return res.json();
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "done"
      ? "status done"
      : status === "error"
      ? "status error"
      : "status pending";
  return <span className={cls}>{status}</span>;
}

export default async function JobsTable() {
  const { jobs } = await fetchJobs();
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>?????</th>
            <th>?????</th>
            <th>?????</th>
            <th>???? ?????</th>
            <th>??????</th>
            <th>????</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ color: "var(--muted)" }}>
                ??? ???? ???? ?????.
              </td>
            </tr>
          ) : (
            jobs.map((j) => (
              <tr key={j.id}>
                <td style={{ fontFamily: "monospace" }}>{j.id.slice(0, 8)}</td>
                <td>
                  <StatusPill status={j.status} />
                </td>
                <td>{j.title || "-"}</td>
                <td>
                  {j.videoUrl ? (
                    <a href={j.videoUrl} target="_blank">
                      ??????
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {j.youtubeVideoId ? (
                    <a href={`https://youtube.com/watch?v=${j.youtubeVideoId}`} target="_blank">
                      ????
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{new Date(j.updatedAt).toLocaleString("fa-IR")}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

