import { useSupabase } from './index.js'
const supabase = useSupabase()

export async function useCurrentGameLoader() {
    let game;

    await supabase.from('games').select('*').order('id', { ascending: false }).limit(1)
        .then((result) => {
            game = result.data[0]
        })


    return { game }
};
