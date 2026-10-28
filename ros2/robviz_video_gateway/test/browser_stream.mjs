// Run against the isolated synthetic_camera_graph, never a real camera graph.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const { chromium } = await import(process.env.ROBVIZ_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.ROBVIZ_TEST_URL;
assert(base, "ROBVIZ_TEST_URL is required");
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error("Browser error:", error));
  await page.goto(base);
  await page.evaluate((base) => {
    document.body.innerHTML = "<h1>Synthetic ROS image / native WebRTC</h1>";
    window.streams = {};
    for (const name of ["color", "depth"]) {
      const topic = `/robviz_test/${name}`;
      const video = document.createElement("video"); video.autoplay = true; video.muted = true; document.body.append(video);
      const ws = new WebSocket(base.replace("http", "ws") + "/ws");
      const state = { ws, pc: null, video, latest: null, offers: 0, pending: [], error: null };
      window.streams[name] = state;
      ws.onopen = () => ws.send(JSON.stringify({ type: "watch", topic, targetFps: 30 }));
      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "stats") state.latest = message;
          if (message.type === "error") state.error = message;
          if (message.type === "offer") {
            state.pc?.close(); state.offers++;
            const pc = new RTCPeerConnection({ iceServers: [], bundlePolicy: "max-bundle" }); state.pc = pc;
            pc.ontrack = (event) => { video.srcObject = event.streams[0] || new MediaStream([event.track]); video.play(); };
            pc.onicecandidate = (event) => { if (event.candidate) ws.send(JSON.stringify({ type: "ice", topic, candidate: event.candidate.candidate, sdpMLineIndex: event.candidate.sdpMLineIndex ?? 0 })); };
            await pc.setRemoteDescription({ type: "offer", sdp: message.sdp });
            for (const candidate of state.pending.splice(0)) await pc.addIceCandidate(candidate);
            const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "answer", topic, sdp: answer.sdp }));
          }
          if (message.type === "ice") {
            const candidate = { candidate: message.candidate, sdpMLineIndex: message.sdpMLineIndex };
            if (state.pc?.remoteDescription) await state.pc.addIceCandidate(candidate); else state.pending.push(candidate);
          }
        } catch (error) { state.error = String(error); }
      };
    }
  }, base);
  await page.waitForFunction(() => Object.values(window.streams).every((s) => s.video.videoWidth > 0 && s.video.readyState >= 2), { timeout: 15000 });
  const sample = () => page.evaluate(async () => {
    const result = {};
    for (const [name, stream] of Object.entries(window.streams)) {
      const stats = [...(await stream.pc.getStats()).values()].find((s) => s.type === "inbound-rtp" && s.kind === "video");
      result[name] = { decoded: stats?.framesDecoded || 0, width: stream.video.videoWidth, height: stream.video.videoHeight, offers: stream.offers, latest: stream.latest, error: stream.error };
    }
    return result;
  });
  const first = await sample();
  const cpuTicks = () => {
    const fields = readFileSync(`/proc/${process.env.ROBVIZ_GRAPH_PID}/stat`, "utf8").split(") ")[1].split(" ");
    return Number(fields[11]) + Number(fields[12]);
  };
  const cpuStart = cpuTicks(); const started = performance.now();
  const sampleSeconds = Math.max(3, Number(process.env.ROBVIZ_BENCHMARK_SECONDS || 3));
  await page.waitForTimeout(sampleSeconds * 1000);
  const elapsedSeconds = (performance.now() - started) / 1000;
  const cpuPercent = (cpuTicks() - cpuStart) / Number(process.env.ROBVIZ_CLOCK_TICKS) / elapsedSeconds * 100;
  const second = await sample();
  assert.equal(second.color.width, 1280); assert.equal(second.color.height, 720);
  assert.equal(second.depth.width, 640); assert.equal(second.depth.height, 480);
  const minimumFrames = (second.color.latest?.encoderInfo?.hardware ? 23 : 13) * sampleSeconds;
  assert(second.color.decoded > first.color.decoded + minimumFrames, JSON.stringify({ first, second }));
  assert(second.depth.decoded > first.depth.decoded + 10, JSON.stringify(second));
  console.log("Synthetic publisher + gateway CPU (100% = one core):", cpuPercent.toFixed(1), "sample seconds:", elapsedSeconds.toFixed(2));
  console.log("Steady frame counts:", JSON.stringify(Object.fromEntries(["color", "depth"].map((name) => [name, {
    decoded: second[name].decoded - first[name].decoded,
    pushed: second[name].latest.pushedFrames - first[name].latest.pushedFrames,
    encoded: second[name].latest.encodedFrames - first[name].latest.encodedFrames,
  }]))));
  console.log("Decoded synthetic streams:", JSON.stringify(second));
  execFileSync("ros2", ["service", "call", "/robviz_test/toggle", "std_srvs/srv/Trigger", "{}"], { timeout: 10000 });
  await page.waitForFunction(() => Object.values(window.streams).every((s) => s.latest?.sourceAvailable === false), { timeout: 5000 });
  const paused = await sample();
  execFileSync("ros2", ["service", "call", "/robviz_test/toggle", "std_srvs/srv/Trigger", "{}"], { timeout: 10000 });
  await page.waitForFunction(() => Object.values(window.streams).every((s) => s.latest?.sourceAvailable === true), { timeout: 5000 });
  await page.waitForTimeout(1000);
  const recovered = await sample();
  assert(recovered.color.decoded > paused.color.decoded);
  assert.equal(recovered.color.offers, paused.color.offers, "Source recovery must not restart the camera or renegotiate a peer");
  execFileSync("ros2", ["service", "call", "/robviz_test/layout", "std_srvs/srv/Trigger", "{}"], { timeout: 10000 });
  await page.waitForFunction(() => window.streams.color.video.videoWidth === 642, { timeout: 10000 });
  assert(!(await sample()).color.error, JSON.stringify(await sample()));
  await page.screenshot({ path: process.env.ROBVIZ_TEST_SCREENSHOT || "/tmp/robviz-native-video.png" });
  console.log("Source pause/resume and padded-stride resolution change passed");
  await page.evaluate(() => { for (const s of Object.values(window.streams)) { s.ws.close(); s.pc.close(); } });
} finally { await browser.close(); }
