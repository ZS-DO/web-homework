import { ref } from "vue";

export function useCachedFetch(fetchFn, key, ttl = 60000) {
  const cache = JSON.parse(localStorage.getItem("apiCache") || "{}");
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchData() {
    if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
      data.value = cache[key].data;
      return;
    }

    loading.value = true;
    try {
      const response = await fetchFn();
      data.value = response;
      cache[key] = { data: response, timestamp: Date.now() };
      localStorage.setItem("apiCache", JSON.stringify(cache));
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetchData };
}
