import { processAnswer, initializeInternalInterview } from "./server/interview-controller";

async function run() {
  const init = await initializeInternalInterview("test-candidate", null, true);
  console.log("Initialized:", init.sessionId);
  const res = await processAnswer(init.sessionId, init.question?.id || "q-1", "This is a test answer to see if it progresses.");
  console.log("Process Answer Response:", JSON.stringify(res, null, 2));
}

run().catch(console.error);
