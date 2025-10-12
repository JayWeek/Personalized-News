import { fetchLocation } from "../api/ipstack.js";

document.getElementById("run-test").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "Fetching location...";
  try {
    const location = await fetchLocation();
    output.textContent = JSON.stringify(location, null, 2);
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
