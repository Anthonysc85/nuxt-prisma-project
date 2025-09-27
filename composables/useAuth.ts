import { ref } from "vue";

export const useAuth = () => {
  const session = ref(null);
  const loading = ref(true);

  const fetchSession = async () => {
    loading.value = true;
    try {
      const res: any = await $fetch("/api/auth/session");
      session.value = res.session;
    } catch {
      session.value = null;
    } finally {
      loading.value = false;
    }
  };

  fetchSession();

  return { session, loading, fetchSession };
};
