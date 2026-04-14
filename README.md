# Controlled Concurrent Request Tester (JavaScript)

A lightweight JavaScript utility for sending **controlled**, **limited-concurrency** POST requests to **your own localhost or staging endpoint**.

> ⚠️ This tool is intended for **authorized testing only** (your own systems). Do not use it against third-party services.

---

## 🚀 Features

- Fixed total request count
- Limited concurrency (worker pool)
- Configurable delay between requests
- Per-request timing
- Success / failure summary
- No dependencies

---

## 📦 Use Case

Useful for testing:

- Contact form submissions
- Internal APIs
- Backend validation logic
- Basic reliability in staging

Example endpoint:

```txt
http://localhost/api/index?action=contact
````

---

## 🧪 JSON POST Example

```javascript
const url = "http://localhost/api/index?action=contact"; // your own test environment
const totalRequests = 10;   // total requests
const concurrency = 2;      // max parallel workers
const delayMs = 300;        // delay between requests

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
```

---

## 📬 Form-Encoded Example (PHP / `$_POST`)

Use this if your backend expects:

```txt
Content-Type: application/x-www-form-urlencoded
```

```javascript
const url = "http://localhost/api/index?action=contact";
const totalRequests = 10;
const concurrency = 2;
const delayMs = 300;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendOne(index) {
  const body = new URLSearchParams({
    name: "test",
    contact: "test@gmail.com",
    message: "test"
  }).toString();

  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
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

  await Promise.all(
    Array.from({ length: concurrency }, (_, i) => worker(i + 1))
  );

  console.table(results);
}

runControlledTest();
```

---

## ⚙️ Configuration

```javascript
const totalRequests = 10;
const concurrency = 2;
const delayMs = 300;
```

### Recommended Safe Defaults

| Setting       | Recommended Range |
| ------------- | ----------------- |
| totalRequests | 5 – 20            |
| concurrency   | 1 – 3             |
| delayMs       | 200 – 1000        |

---

## 📊 Example Output

```txt
worker=1 request=1 ok=true status=200 time=84ms
worker=2 request=2 ok=true status=200 time=91ms
worker=1 request=3 ok=true status=200 time=79ms
worker=2 request=4 ok=false status=500 time=65ms

Test completed
Total: 4
Successful: 3
Failed: 1
```

---

## 🧠 How It Works

* A small **worker pool** controls concurrency
* Each worker:

  1. Picks the next request
  2. Sends it
  3. Logs the result
  4. Waits briefly
  5. Repeats

This prevents overwhelming your system.

---

## ⚠️ Notes

* Use only on systems you own or are authorized to test
* Prefer **localhost** or **staging**
* Avoid high concurrency in production
* Respect backend rate limits
* Monitor logs instead of increasing load blindly

---

## 🔧 Possible Improvements

* Retry mechanism
* Timeout handling
* Response body logging
* Export results (JSON / CSV)
* Average response time calculation
* Status grouping

---

## 📄 License

Free to use for safe, authorized testing on your own systems.
