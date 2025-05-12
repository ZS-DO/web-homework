import { reactive } from "vue";

export const store = reactive({
  loading: false,
  setLoading(status) {
    this.loading = status;
  },
});
