const url = "http://localhost/api/index?action=contact"; // use only your own test environment
const totalRequests = 10;   // total number of requests
const concurrency = 2;      // max number of simultaneous requests
const delayMs = 300;        // short delay between each worker request

const payload = {
  name: "test",
  contact: "test@gmail.com",
  message: "test"
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendOne(index) {
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const duration = Math.round(performance.now() - start);

    return {
      index,
      ok: res.ok,
      status: res.status,
      duration
    };
  } catch (error) {
    const duration = Math.round(performance.now() - start);

    return {
      index,
      ok: false,
      status: 0,
      duration,
      error: String(error)
    };
  }
}

async function runControlledTest() {
  const results = [];
  let nextIndex = 0;

  async function worker(workerId) {
    while (nextIndex < totalRequests) {
      const current = nextIndex++;
      const result = await sendOne(current + 1);
      results.push(result);

      console.log(
        `worker=${workerId} request=${result.index} ok=${result.ok} status=${result.status} time=${result.duration}ms`
      );

      await delay(delayMs);
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  const successCount = results.filter(r => r.ok).length;
  const failCount = results.length - successCount;

  console.log("\nTest completed");
  console.log("Total:", results.length);
  console.log("Successful:", successCount);
  console.log("Failed:", failCount);
  console.table(results);
}

runControlledTest();
