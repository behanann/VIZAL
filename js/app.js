/* VIZAL shared UI helpers */
const GITHUB_REPO = "https://github.com/your-username/vizal";

document.querySelectorAll("[data-github]").forEach(link => {
  link.href = GITHUB_REPO;
});

document.querySelectorAll('input[type="range"]').forEach(range => {
  const output = document.getElementById(`${range.id}-value`);
  if (!output) return;
  const update = () => output.textContent = `${range.value}%`;
  range.addEventListener("input", update);
  update();
});
