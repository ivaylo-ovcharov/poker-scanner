import { useSupabase } from './index.js'
const supabase = useSupabase()

export async function useCurrentHandLoader() {
    let hand;

    await supabase.from('hands').select('*').order('id', { ascending: false }).limit(1)
        .then((result) => {
            hand = result.data[0]
        })

    supabase
        .channel('*')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hands' }, (payload) => {
            console.log(payload.new);
            hand = payload.new
        }).subscribe()


    return { hand }
};
