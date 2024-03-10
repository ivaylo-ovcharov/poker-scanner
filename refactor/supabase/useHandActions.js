import { useSupabase } from "./useSupabase.js";

export default function useHandActions() {
  const supabase = useSupabase();

  return {
    createHandRecord(payload = {}) {
      supabase
        .from("hands_history")
        .insert(payload)
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
    },
  };
}
